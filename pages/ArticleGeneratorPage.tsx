import React, { useState, useEffect } from 'react';
import * as ReactRouterDom from 'react-router-dom';
import MetaTags from '../components/MetaTags';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import { generateImages, generateFullArticle, generateArticleMetadata } from '../services/geminiService';
import { BlogPost } from '../data/blogData';

type GenerationState = 'idle' | 'generating' | 'publishing' | 'complete' | 'error';

const ArticleGeneratorPage: React.FC = () => {
    const [topic, setTopic] = useState('');
    const [generationState, setGenerationState] = useState<GenerationState>('idle');
    const [generationLog, setGenerationLog] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [finalArticle, setFinalArticle] = useState<{ post: Omit<BlogPost, 'author' | 'originalUrl'> & { originalUrl: string }, imagePreview: string } | null>(null);
    
    const logContainerRef = React.useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Auto-scroll the log container
        if (logContainerRef.current) {
            logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
        }
    }, [generationLog]);

    const slugify = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const addLog = (message: string) => {
        setGenerationLog(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
    };

    const handleGenerateAndPublish = async () => {
        if (!topic) {
            setError('Please enter a topic to begin.');
            return;
        }

        setGenerationState('generating');
        setError(null);
        setGenerationLog([]);
        setFinalArticle(null);

        try {
            // Step 1: Generate full article content
            addLog('Starting article generation... This is the longest step and may take several minutes.');
            const articleContent = await generateFullArticle(topic);
            addLog('✅ Full article content generated successfully.');

            // Step 2: Generate metadata
            addLog('Creating metadata (title, excerpt, categories)...');
            const metadata = await generateArticleMetadata(articleContent, topic);
            addLog(`✅ Metadata created. Title: "${metadata.title}"`);

            // Step 3: Generate featured image
            addLog('Generating featured image with Imagen 4.0...');
            const imagePrompt = `A cinematic, breathtaking artwork representing the blog post titled: "${metadata.title}". High detail, epic scale, photorealistic.`;
            const images = await generateImages(imagePrompt, '16:9', 1);
            if (!images || images.length === 0) {
                throw new Error('Image generation failed to return an image.');
            }
            const featuredImage = images[0];
            addLog('✅ Featured image generated successfully.');
            
            // Prepare the final post object for publishing
            const finalSlug = `${slugify(metadata.title)}-${Date.now()}`;
            
            // FIX: Create a full HTML document for the data URI to ensure the content can be displayed in the iframe.
            const articleContentWithHtml = `<!DOCTYPE html>
<html>
<head>
  <title>${metadata.title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #eee; background-color: #111; padding: 2rem; max-width: 800px; margin: 0 auto; }
    img { max-width: 100%; height: auto; border-radius: 8px; }
    h1, h2, h3, h4, h5, h6 { color: #4ade80; }
    a { color: #6ee7b7; }
    p, li { color: #d1d5db; }
  </style>
</head>
<body>
  <h1>${metadata.title}</h1>
  ${articleContent}
</body>
</html>`;

            const newPost = {
                slug: finalSlug,
                title: metadata.title,
                excerpt: metadata.excerpt,
                content: articleContent,
                published: new Date().toISOString(),
                featuredImage: featuredImage,
                categories: metadata.categories || [],
                // FIX: Add the required 'originalUrl' property. Using a data URI allows the content to be iframed.
                originalUrl: `data:text/html;charset=utf-8,${encodeURIComponent(articleContentWithHtml)}`,
            };

            setFinalArticle({ post: newPost, imagePreview: featuredImage });
            
            // Step 4: Publish the article
            setGenerationState('publishing');
            addLog('All assets are ready. Publishing to the blog...');
            const response = await fetch('/api/publish-article', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newPost),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to publish article.');
            }

            addLog('🚀 Article published successfully! Vercel is now deploying the update.');
            addLog('Your new article will be live in 2-3 minutes.');
            setGenerationState('complete');

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            setError(errorMessage);
            addLog(`❌ Error: ${errorMessage}`);
            setGenerationState('error');
        }
    };

    const handleReset = () => {
        setTopic('');
        setGenerationState('idle');
        setError(null);
        setGenerationLog([]);
        setFinalArticle(null);
    };

    const isWorking = generationState === 'generating' || generationState === 'publishing';

    return (
        <>
            <MetaTags title="Automated Article Assistant | Seedream ImagenBrainAi 4.0" description="Use a one-click AI assistant to generate and publish a complete, SEO-optimized article with a featured image directly to your blog." canonicalPath="/admin/generate-article" />
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-6xl font-extrabold mb-4">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-200 to-green-400">Automated Article Assistant</span>
                    </h1>
                    <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto">Your one-click solution to generate, illustrate, and publish a complete blog post.</p>
                </div>
                
                <div className="bg-gray-900/50 border border-green-400/10 rounded-lg p-8 space-y-6">
                    {generationState === 'idle' && (
                        <>
                            <div>
                                <label htmlFor="topic" className="block text-lg font-medium text-green-300 mb-2">Article Topic</label>
                                <input id="topic" type="text" value={topic} onChange={(e) => setTopic(e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded-md p-3" placeholder="e.g., The Future of Renewable Energy"/>
                            </div>
                            {error && <p className="text-red-400 text-center bg-red-900/20 p-3 rounded-lg">{error}</p>}
                            <Button onClick={handleGenerateAndPublish} disabled={!topic}>Generate & Publish Article</Button>
                        </>
                    )}

                    {isWorking && <Spinner />}

                    {generationLog.length > 0 && (
                        <div>
                             <h3 className="text-xl font-semibold text-green-300 mb-3 text-center">Generation Progress</h3>
                             <div ref={logContainerRef} className="bg-black/50 border border-gray-700 rounded-lg p-4 h-64 overflow-y-auto font-mono text-sm text-gray-400 space-y-1">
                                {generationLog.map((log, index) => <p key={index} className={log.includes('✅') ? 'text-green-400' : log.includes('❌') ? 'text-red-400' : ''}>{log}</p>)}
                             </div>
                        </div>
                    )}
                    
                    {finalArticle?.imagePreview && (
                        <div>
                             <h3 className="text-xl font-semibold text-green-300 mb-3 text-center">Generated Featured Image</h3>
                             <img src={finalArticle.imagePreview} alt="Generated featured" className="rounded-lg w-full aspect-video object-cover"/>
                        </div>
                    )}

                    {(generationState === 'complete' || generationState === 'error') && (
                         <div className="text-center space-y-4 pt-4 border-t border-gray-700">
                             {generationState === 'complete' && finalArticle && (
                                 <div>
                                    <h3 className="text-2xl font-bold text-green-300">Success!</h3>
                                    <p className="text-gray-300">Your article is published and will be live shortly.</p>
                                     <ReactRouterDom.Link to={`/blog/${finalArticle.post.slug}`} className="mt-4 inline-block">
                                        <Button variant="primary">View Your New Article</Button>
                                    </ReactRouterDom.Link>
                                 </div>
                             )}
                             <Button onClick={handleReset} variant="secondary">Start a New Article</Button>
                         </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default ArticleGeneratorPage;