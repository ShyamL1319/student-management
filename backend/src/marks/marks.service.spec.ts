import { MarksService } from './marks.service';

describe('MarksService', () => {
  const service = new MarksService(null as any);

  it('calculates GPA correctly', () => {
    expect(service.calculateGPA(90, 100)).toBe(4.0);
    expect(service.calculateGPA(75, 100)).toBe(3.0);
    expect(service.calculateGPA(60, 100)).toBe(2.0);
    expect(service.calculateGPA(45, 100)).toBe(1.0);
    expect(service.calculateGPA(10, 100)).toBe(0.0);
  });

  it('calculates Grade correctly', () => {
    expect(service.calculateGrade(90, 100)).toBe('A+');
    expect(service.calculateGrade(75, 100)).toBe('A');
    expect(service.calculateGrade(60, 100)).toBe('B');
    expect(service.calculateGrade(45, 100)).toBe('C');
    expect(service.calculateGrade(10, 100)).toBe('F');
  });
});
