import { describe, expect, it } from 'vitest'
import { adminPrompt, careerPrompt, homeworkPrompt, parentPrompt, studyPlanPrompt, teacherPrompt, tutorPrompt } from './prompts'

describe('tutorPrompt', () => {
  it('includes the student name and grade', () => {
    const prompt = tutorPrompt('Leon', '5A')
    expect(prompt).toContain('Leon')
    expect(prompt).toContain('5A')
  })
})

describe('homeworkPrompt', () => {
  it('instructs hints-only, no final answers, in student mode', () => {
    const prompt = homeworkPrompt('student')
    expect(prompt.toLowerCase()).toContain('hint')
    expect(prompt).toMatch(/not reveal the final answer/i)
  })

  it('instructs full worked solutions in teacher mode', () => {
    const prompt = homeworkPrompt('teacher')
    expect(prompt).toMatch(/full worked solutions/i)
  })

  it('produces different instructions for the two modes', () => {
    expect(homeworkPrompt('student')).not.toEqual(homeworkPrompt('teacher'))
  })
})

describe('careerPrompt / studyPlanPrompt / parentPrompt', () => {
  it('embeds the provided context verbatim', () => {
    const context = 'Attendance: 92%. GPA: 3.4.'
    expect(careerPrompt(context)).toContain(context)
    expect(studyPlanPrompt(context)).toContain(context)
    expect(parentPrompt('Leon', context)).toContain(context)
    expect(parentPrompt('Leon', context)).toContain('Leon')
  })
})

describe('teacherPrompt', () => {
  it('includes the teacher name and subject', () => {
    const prompt = teacherPrompt('Sabine', 'Mathematics')
    expect(prompt).toContain('Sabine')
    expect(prompt).toContain('Mathematics')
  })
})

describe('adminPrompt', () => {
  it('uses a regional-oversight persona for AUTHORITY', () => {
    const prompt = adminPrompt('AUTHORITY', 'DIS', 'data')
    expect(prompt.toLowerCase()).toContain('regional')
  })

  it('uses a school-administration persona for ADMINISTRATOR', () => {
    const prompt = adminPrompt('ADMINISTRATOR', 'DIS', 'data')
    expect(prompt.toLowerCase()).not.toContain('regional')
    expect(prompt.toLowerCase()).toContain('school administration')
  })

  it('embeds the school name in both personas', () => {
    expect(adminPrompt('AUTHORITY', 'Deggendorf International School', 'data')).toContain('Deggendorf International School')
    expect(adminPrompt('ADMINISTRATOR', 'Deggendorf International School', 'data')).toContain('Deggendorf International School')
  })
})
