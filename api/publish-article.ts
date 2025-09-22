import type { VercelRequest, VercelResponse } from '@vercel/node';
import { BlogPost } from '../data/blogData';

// Helper function to format the new post data into a TypeScript file content
const formatPostToFileContent = (newPost: BlogPost): string => {
    // Escape backticks, backslashes, and dollar signs in the main content for template literal compatibility
    const escapedContent = newPost.content.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$');
    // Use JSON.stringify for all other string values to handle all special characters (quotes, newlines, etc.) safely.
    const featuredImageString = newPost.featuredImage ? JSON.stringify(newPost.featuredImage) : 'null';
    const keywordsString = newPost.keywords ? JSON.stringify(newPost.keywords) : '[]';


    return `
  {
    "slug": ${JSON.stringify(newPost.slug)},
    "title": ${JSON.stringify(newPost.title)},
    "published": ${JSON.stringify(newPost.published)},
    "author": "Kunal Sonpitre",
    "categories": ${JSON.stringify(newPost.categories)},
    "keywords": ${keywordsString},
    "featuredImage": ${featuredImageString},
    "excerpt": ${JSON.stringify(newPost.excerpt)},
    "content": \`${escapedContent}\`
  },
`;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { GITHUB_TOKEN, GITHUB_REPO_URL } = process.env;

    if (!GITHUB_TOKEN || !GITHUB_REPO_URL) {
        return res.status(500).json({ message: 'Server configuration error: GitHub token or repo URL is missing.' });
    }

    const urlParts = GITHUB_REPO_URL.split('/');
    const owner = urlParts[urlParts.length - 2];
    const repo = urlParts[urlParts.length - 1].replace('.git', '');
    
    if(!owner || !repo) {
        return res.status(500).json({ message: 'Could not parse GitHub owner and repo from GITHUB_REPO_URL.' });
    }
    
    const filePath = 'data/blogPosts.ts';
    const GITHUB_API_URL = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;

    try {
        const getFileResponse = await fetch(GITHUB_API_URL, {
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json',
            },
        });

        if (!getFileResponse.ok) {
            const errorData = await getFileResponse.json();
            return res.status(getFileResponse.status).json({ message: `Failed to fetch file from GitHub: ${errorData.message}` });
        }
        
        const fileData = await getFileResponse.json();
        // FIX: Replaced Buffer with TextDecoder to support environments where Node.js types are not available.
        const uint8Array = Uint8Array.from(atob(fileData.content), c => c.charCodeAt(0));
        const currentContent = new TextDecoder().decode(uint8Array);
        const currentSha = fileData.sha;

        const newPostData: BlogPost = req.body;
        const newPostContent = formatPostToFileContent(newPostData);

        const insertionIndex = currentContent.indexOf('[') + 1;
        const updatedContent = [
            currentContent.slice(0, insertionIndex),
            newPostContent,
            currentContent.slice(insertionIndex)
        ].join('');

        // FIX: Replaced Buffer with TextEncoder and btoa to support environments where Node.js types are not available.
        const updatedUint8Array = new TextEncoder().encode(updatedContent);
        let binaryStr = "";
        for (let i = 0; i < updatedUint8Array.length; i++) {
            binaryStr += String.fromCharCode(updatedUint8Array[i]);
        }
        const newContentBase64 = btoa(binaryStr);
        
        const updateFileResponse = await fetch(GITHUB_API_URL, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: `feat: add new blog post "${newPostData.title}"`,
                content: newContentBase64,
                sha: currentSha,
            }),
        });

        if (!updateFileResponse.ok) {
            const errorData = await updateFileResponse.json();
            return res.status(updateFileResponse.status).json({ message: `Failed to update file on GitHub: ${errorData.message}` });
        }

        res.status(200).json({ message: 'Article published successfully!' });

    } catch (error) {
        console.error('Error in publish-article function:', error);
        res.status(500).json({ message: 'An internal server error occurred.' });
    }
}