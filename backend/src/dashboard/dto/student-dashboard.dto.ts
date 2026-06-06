import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class StudentProfileDto {
  @ApiProperty({ example: 'Priya Sharma' })
  name!: string;

  @ApiProperty({ example: 'STU-2024-089' })
  id!: string;

  @ApiProperty({ example: 'XII-A' })
  class!: string;

  @ApiProperty({ example: 'Science' })
  section!: string;

  @ApiProperty({ example: '089' })
  rollNo!: string;

  @ApiProperty({ example: '2024-2025' })
  academicYear!: string;

  @ApiProperty({ example: 3.85 })
  gpa!: number;

  @ApiProperty({ example: 92 })
  attendancePct!: number;

  @ApiProperty({ example: 18 })
  completedAssignments!: number;

  @ApiProperty({ example: 4 })
  pendingAssignments!: number;

  @ApiProperty({ example: 3 })
  upcomingExams!: number;

  @ApiProperty({ example: 6 })
  subjectsEnrolled!: number;

  @ApiProperty({ example: 7 })
  notifications!: number;
}

export class ScheduleItemDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  subject!: string;

  @ApiProperty()
  teacher!: string;

  @ApiProperty({ example: '08:00 – 09:00' })
  time!: string;

  @ApiProperty()
  room!: string;

  @ApiProperty({ enum: ['completed', 'current', 'upcoming'] })
  status!: 'completed' | 'current' | 'upcoming';

  @ApiProperty({ example: '#6366f1' })
  color!: string;
}

export class AssignmentItemDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty()
  subject!: string;

  @ApiProperty()
  due!: string;

  @ApiProperty({ enum: ['pending', 'submitted', 'graded'] })
  status!: 'pending' | 'submitted' | 'graded';

  @ApiProperty({ enum: ['high', 'medium', 'low'] })
  priority!: 'high' | 'medium' | 'low';

  @ApiPropertyOptional()
  grade?: string;
}

export class ExamItemDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  subject!: string;

  @ApiProperty()
  date!: string;

  @ApiProperty()
  time!: string;

  @ApiProperty()
  venue!: string;

  @ApiProperty()
  countdown!: number;
}

export class AttendanceItemDto {
  @ApiProperty()
  subject!: string;

  @ApiProperty()
  attended!: number;

  @ApiProperty()
  total!: number;

  @ApiProperty()
  pct!: number;
}

export class SubjectScoreDto {
  @ApiProperty()
  name!: string;

  @ApiProperty()
  score!: number;

  @ApiProperty()
  color!: string;
}

export class GpaGrowthItemDto {
  @ApiProperty()
  month!: string;

  @ApiProperty()
  gpa!: number;
}

export class ResourceItemDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty()
  type!: string;

  @ApiProperty()
  subject!: string;

  @ApiProperty()
  size!: string;
}

export class AnnouncementItemDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty({ enum: ['exam', 'event', 'notice'] })
  type!: 'exam' | 'event' | 'notice';

  @ApiProperty()
  time!: string;

  @ApiProperty()
  urgent!: boolean;
}

export class FeeHistoryItemDto {
  @ApiProperty()
  desc!: string;

  @ApiProperty()
  date!: string;

  @ApiProperty()
  amount!: number;

  @ApiProperty({ enum: ['paid', 'pending'] })
  status!: 'paid' | 'pending';
}

export class FeesSummaryDto {
  @ApiProperty()
  paid!: number;

  @ApiProperty()
  outstanding!: number;

  @ApiProperty()
  dueDate!: string;

  @ApiProperty({ type: [FeeHistoryItemDto] })
  history!: FeeHistoryItemDto[];
}

export class AchievementItemDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty()
  subtitle!: string;

  @ApiProperty()
  icon!: string;
}

export class ClassRankDto {
  @ApiProperty()
  position!: number;

  @ApiProperty()
  label!: string;
}

export class CommunicationItemDto {
  @ApiProperty()
  name!: string;

  @ApiProperty()
  role!: string;

  @ApiProperty()
  msg!: string;

  @ApiProperty()
  time!: string;

  @ApiProperty()
  unread!: number;

  @ApiProperty()
  color!: string;
}

export class StudentDashboardResponseDto {
  @ApiProperty({ type: StudentProfileDto })
  student!: StudentProfileDto;

  @ApiProperty({ type: [ScheduleItemDto] })
  schedule!: ScheduleItemDto[];

  @ApiProperty({ type: [AssignmentItemDto] })
  assignments!: AssignmentItemDto[];

  @ApiProperty({ type: [ExamItemDto] })
  exams!: ExamItemDto[];

  @ApiProperty({ type: [AttendanceItemDto] })
  attendance!: AttendanceItemDto[];

  @ApiProperty({ type: [SubjectScoreDto] })
  subjects!: SubjectScoreDto[];

  @ApiProperty({ type: [GpaGrowthItemDto] })
  gpaGrowth!: GpaGrowthItemDto[];

  @ApiProperty({ type: [ResourceItemDto] })
  resources!: ResourceItemDto[];

  @ApiProperty({ type: [AnnouncementItemDto] })
  announcements!: AnnouncementItemDto[];

  @ApiProperty({ type: FeesSummaryDto })
  fees!: FeesSummaryDto;

  @ApiProperty({ type: [AchievementItemDto] })
  achievements!: AchievementItemDto[];

  @ApiProperty({ type: ClassRankDto })
  rank!: ClassRankDto;

  @ApiProperty({ type: [CommunicationItemDto] })
  communications!: CommunicationItemDto[];
}
