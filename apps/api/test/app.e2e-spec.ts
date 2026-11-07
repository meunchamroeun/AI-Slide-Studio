import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';

describe('AI Slide Animation Studio API (e2e)', () => {
  let app: INestApplication;
  let createdPresentationId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: false,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('1. GET /api/health returns 200 with service status and PostgreSQL connectivity', async () => {
    const res = await request(app.getHttpServer()).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.database).toBe('connected');
    expect(res.body.aiModel).toBeDefined();
  });

  it('2. POST /api/generation/presentations generates a valid structured presentation', async () => {
    const payload = {
      prompt: 'Build a 6-slide executive overview of Distributed Vector Indexing and Semantic Search.',
      slideCount: 6,
      theme: 'technology-gradient',
      aspectRatio: '16:9',
      language: 'English',
      audience: 'Engineering Leadership',
      tone: 'Analytical & Technical',
      style: 'Modern SaaS Dark',
      animationStyle: 'dynamic',
      visualAssetPreference: 'mixed',
    };

    const res = await request(app.getHttpServer())
      .post('/api/generation/presentations')
      .send(payload);

    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.slides).toHaveLength(6);
    expect(res.body.theme).toBe('technology-gradient');
    expect(res.body.aspectRatio).toBe('16:9');

    createdPresentationId = res.body.id;

    // Verify slide schema and animations
    const firstSlide = res.body.slides[0];
    expect(firstSlide.layout).toBe('cover');
    expect(firstSlide.animation.preset).toBeDefined();
    expect(firstSlide.transition.type).toBeDefined();
  });

  it('3. GET /api/presentations retrieves the list of presentations from PostgreSQL', async () => {
    const res = await request(app.getHttpServer()).get('/api/presentations');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.some((p: any) => p.id === createdPresentationId)).toBe(true);
  });

  it('4. GET /api/presentations/:id retrieves the created presentation document', async () => {
    const res = await request(app.getHttpServer()).get(`/api/presentations/${createdPresentationId}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(createdPresentationId);
    expect(res.body.slides.length).toBeGreaterThan(0);
  });

  it('5. PATCH /api/presentations/:id updates title and theme successfully', async () => {
    const updatePayload = {
      title: 'Updated Distributed Vector Architecture Keynote',
      theme: 'corporate-blue',
    };

    const res = await request(app.getHttpServer())
      .patch(`/api/presentations/${createdPresentationId}`)
      .send(updatePayload);

    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Updated Distributed Vector Architecture Keynote');
    expect(res.body.theme).toBe('corporate-blue');
  });

  it('6. POST /api/presentations/:id/duplicate creates an exact clone', async () => {
    const res = await request(app.getHttpServer()).post(`/api/presentations/${createdPresentationId}/duplicate`);
    expect(res.status).toBe(201);
    expect(res.body.id).not.toBe(createdPresentationId);
    expect(res.body.title).toContain('(Copy)');
    expect(res.body.slides).toHaveLength(6);

    // Clean up duplicate
    await request(app.getHttpServer()).delete(`/api/presentations/${res.body.id}`);
  });

  it('7. GET /api/presentations/:id/export/html returns standalone offline HTML', async () => {
    const res = await request(app.getHttpServer()).get(`/api/presentations/${createdPresentationId}/export/html`);
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('text/html');

    const html = res.text;
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('class="stage"');
    expect(html).toContain('animateCounters');
    expect(html).toContain('goToSlide');
    expect(html).toContain('toggleFullscreen');
  });

  it('8. GET /api/presentations/:id/export/json returns project JSON backup', async () => {
    const res = await request(app.getHttpServer()).get(`/api/presentations/${createdPresentationId}/export/json`);
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('application/json');

    const parsed = JSON.parse(res.text);
    expect(parsed.id).toBe(createdPresentationId);
    expect(parsed.slides).toBeDefined();
  });

  it('9. POST /api/presentations/import/json imports presentation document from backup', async () => {
    const jsonPayload = JSON.stringify({
      title: 'Imported Backup Presentation',
      theme: 'minimal-light',
      aspectRatio: '16:9',
      slides: [
        {
          id: 'imported-slide-1',
          slideNumber: 1,
          layout: 'cover',
          content: { title: 'Imported Deck', subtitle: 'Restored from JSON backup' },
          notes: '',
          animation: { preset: 'fade-in', duration: 0.8, delay: 0, easing: 'power2.out', direction: 'none' },
          transition: { type: 'fade', duration: 0.6, easing: 'power2.out' },
        },
      ],
      metadata: {
        topic: 'Imported Topic',
        language: 'English',
        audience: 'General',
        tone: 'Professional',
        style: 'Minimal',
        theme: 'minimal-light',
        aspectRatio: '16:9',
        animationStyle: 'subtle',
        visualAssetPreference: 'geometric',
        version: '1.0.0',
      },
    });

    const res = await request(app.getHttpServer())
      .post('/api/presentations/import/json')
      .send({ json: jsonPayload });

    expect(res.status).toBe(201);
    expect(res.body.title).toBe('Imported Backup Presentation');
    expect(res.body.slides).toHaveLength(1);

    // Clean up imported presentation
    await request(app.getHttpServer()).delete(`/api/presentations/${res.body.id}`);
  });

  it('10. DELETE /api/presentations/:id deletes presentation', async () => {
    const res = await request(app.getHttpServer()).delete(`/api/presentations/${createdPresentationId}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // Verify it is gone
    const getRes = await request(app.getHttpServer()).get(`/api/presentations/${createdPresentationId}`);
    expect(getRes.status).toBe(404);
  });
});
