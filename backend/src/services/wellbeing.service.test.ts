import { describe, expect, it } from 'vitest'
import { computeInsights } from './wellbeing.service'

describe('computeInsights', () => {
  it('scores a confident HAPPY check-in as low risk', () => {
    const result = computeInsights('HAPPY', 90)
    expect(result.riskLevel).toBe('LOW')
    expect(result.stressLevel).toBeLessThan(45)
  })

  it('scores a confident ANXIOUS check-in as high risk', () => {
    const result = computeInsights('ANXIOUS', 90)
    expect(result.riskLevel).toBe('HIGH')
    expect(result.stressLevel).toBeGreaterThanOrEqual(70)
  })

  it('weights stress level by confidence for the same emotion', () => {
    const lowConfidence = computeInsights('STRESSED', 10)
    const highConfidence = computeInsights('STRESSED', 100)
    expect(highConfidence.stressLevel).toBeGreaterThan(lowConfidence.stressLevel)
  })

  it('returns emotion-specific response and recommendation text', () => {
    const result = computeInsights('CALM', 50)
    expect(result.aiResponse.length).toBeGreaterThan(0)
    expect(result.recommendation.length).toBeGreaterThan(0)
  })
})
