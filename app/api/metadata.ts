// pages/api/metadata.ts (Next.js) or equivalent endpoint
import { NextApiRequest, NextApiResponse } from 'next';

interface MetadataResponse {
  title?: string;
  description?: string;
  image?: string;
  siteName?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<MetadataResponse | { error: string }>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    // Simple HTML fetching with basic headers
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; LinkPreview/1.0)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      // Add timeout
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    
    // Simple regex-based extraction (lightweight alternative to cheerio)
    const extractMetaTag = (html: string, pattern: RegExp): string | undefined => {
      const match = html.match(pattern);
      return match ? match[1] : undefined;
    };

    // Extract title
    const title = extractMetaTag(html, /<title[^>]*>([^<]+)<\/title>/i) ||
                 extractMetaTag(html, /<meta\s+property="og:title"\s+content="([^"]+)"/i) ||
                 extractMetaTag(html, /<meta\s+name="twitter:title"\s+content="([^"]+)"/i);

    // Extract description
    const description = extractMetaTag(html, /<meta\s+name="description"\s+content="([^"]+)"/i) ||
                       extractMetaTag(html, /<meta\s+property="og:description"\s+content="([^"]+)"/i) ||
                       extractMetaTag(html, /<meta\s+name="twitter:description"\s+content="([^"]+)"/i);

    // Extract image
    const image = extractMetaTag(html, /<meta\s+property="og:image"\s+content="([^"]+)"/i) ||
                 extractMetaTag(html, /<meta\s+name="twitter:image"\s+content="([^"]+)"/i) ||
                 extractMetaTag(html, /<link\s+rel="image_src"\s+href="([^"]+)"/i);

    // Extract site name
    const siteName = extractMetaTag(html, /<meta\s+property="og:site_name"\s+content="([^"]+)"/i);

    // Clean up extracted data
    const cleanText = (text: string | undefined): string | undefined => {
      if (!text) return undefined;
      return text.replace(/&quot;/g, '"')
                 .replace(/&amp;/g, '&')
                 .replace(/&lt;/g, '<')
                 .replace(/&gt;/g, '>')
                 .replace(/&#x27;/g, "'")
                 .replace(/&#x2F;/g, '/')
                 .trim();
    };

    // Handle relative image URLs
    const cleanImage = (imageUrl: string | undefined): string | undefined => {
      if (!imageUrl) return undefined;
      
      try {
        // If it's already a full URL, return as is
        if (imageUrl.startsWith('http')) {
          return imageUrl;
        }
        
        // Handle protocol-relative URLs
        if (imageUrl.startsWith('//')) {
          return `https:${imageUrl}`;
        }
        
        // Handle relative URLs
        if (imageUrl.startsWith('/')) {
          const urlObj = new URL(url);
          return `${urlObj.origin}${imageUrl}`;
        }
        
        return imageUrl;
      } catch {
        return undefined;
      }
    };

    const metadata: MetadataResponse = {
      title: cleanText(title),
      description: cleanText(description),
      image: cleanImage(image),
      siteName: cleanText(siteName),
    };

    res.status(200).json(metadata);

  } catch (error) {
    console.error('Error fetching metadata:', error);
    res.status(500).json({ error: 'Failed to fetch metadata' });
  }
}

// Alternative: Pure client-side approach using a CORS proxy
export async function fetchMetadataClientSide(url: string) {
  try {
    // Using a free CORS proxy (be careful about rate limits)
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
    
    const response = await fetch(proxyUrl);
    const data = await response.json();
    
    if (data.contents) {
      const html = data.contents;
      
      // Same extraction logic as above
      const extractMetaTag = (html: string, pattern: RegExp): string | undefined => {
        const match = html.match(pattern);
        return match ? match[1] : undefined;
      };

      const title = extractMetaTag(html, /<title[^>]*>([^<]+)<\/title>/i) ||
                   extractMetaTag(html, /<meta\s+property="og:title"\s+content="([^"]+)"/i);

      const description = extractMetaTag(html, /<meta\s+name="description"\s+content="([^"]+)"/i) ||
                         extractMetaTag(html, /<meta\s+property="og:description"\s+content="([^"]+)"/i);

      const image = extractMetaTag(html, /<meta\s+property="og:image"\s+content="([^"]+)"/i);

      return {
        title: title?.replace(/&quot;/g, '"').replace(/&amp;/g, '&').trim(),
        description: description?.replace(/&quot;/g, '"').replace(/&amp;/g, '&').trim(),
        image: image,
      };
    }
    
    return null;
  } catch (error) {
    console.error('Client-side fetch failed:', error);
    return null;
  }
}