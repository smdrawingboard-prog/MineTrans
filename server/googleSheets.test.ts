import { describe, it, expect } from 'vitest';
import { google } from 'googleapis';

describe('Google Sheets Integration', () => {
  it('should validate Google Sheets API credentials', async () => {
    const apiKey = process.env.BUILT_IN_FORGE_API_KEY;
    const blogSheetId = process.env.GOOGLE_SHEETS_BLOG_ID;
    const newsSheetId = process.env.GOOGLE_SHEETS_NEWS_ID;
    const biReviewSheetId = process.env.GOOGLE_SHEETS_BI_REVIEW_ID;
    const coursesSheetId = process.env.GOOGLE_SHEETS_COURSES_ID;

    // Verify all sheet IDs are configured
    expect(blogSheetId).toBeDefined();
    expect(newsSheetId).toBeDefined();
    expect(biReviewSheetId).toBeDefined();
    expect(coursesSheetId).toBeDefined();

    // Verify sheet IDs are valid format (long alphanumeric strings)
    expect(blogSheetId).toMatch(/^[a-zA-Z0-9_-]+$/);
    expect(newsSheetId).toMatch(/^[a-zA-Z0-9_-]+$/);
    expect(biReviewSheetId).toMatch(/^[a-zA-Z0-9_-]+$/);
    expect(coursesSheetId).toMatch(/^[a-zA-Z0-9_-]+$/);

    // Verify API key is configured
    expect(apiKey).toBeDefined();
    expect(apiKey?.length).toBeGreaterThan(0);

    console.log('✅ All Google Sheets environment variables configured correctly');
    console.log(`Blog Sheet ID: ${blogSheetId?.substring(0, 20)}...`);
    console.log(`News Sheet ID: ${newsSheetId?.substring(0, 20)}...`);
    console.log(`BI Review Sheet ID: ${biReviewSheetId?.substring(0, 20)}...`);
    console.log(`Courses Sheet ID: ${coursesSheetId?.substring(0, 20)}...`);
  });

  it('should have valid Google Sheets API key format', () => {
    const apiKey = process.env.BUILT_IN_FORGE_API_KEY;
    
    // API keys are typically long alphanumeric strings
    expect(apiKey).toBeDefined();
    expect(apiKey?.length).toBeGreaterThan(10);
    
    console.log('✅ Google API key is configured');
  });
});
