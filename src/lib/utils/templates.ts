import { BoardTemplate } from '@/types';

export const BOARD_TEMPLATES: BoardTemplate[] = [
  {
    id: 'job_tracking',
    name: 'Job Tracking',
    description: 'Track applications from applied to offer.',
    defaultColumns: ['Applied', 'Viewed', 'Interview', 'Offer', 'Rejected'],
    schema: {
      attributes: [
        { id: 'title', name: 'Company', type: 'short_text', isEnabled: true, required: true },
        {
          id: 'status',
          name: 'Status',
          type: 'select',
          options: ['Applied', 'Viewed', 'Interview', 'Offer', 'Rejected'],
          isEnabled: true,
        },
        { id: 'role', name: 'Role', type: 'short_text', isEnabled: true },
        { id: 'salary', name: 'Salary', type: 'short_text', isEnabled: true },
        { id: 'deadline', name: 'Deadline', type: 'date', isEnabled: true },
        { id: 'link', name: 'Job Link', type: 'url', isEnabled: true },
        { id: 'cover_letter', name: 'Cover Letter', type: 'markdown', isEnabled: true },
        {
          id: 'tags',
          name: 'Tags',
          type: 'select',
          options: ['Remote', 'On-site', 'Hybrid', 'Full-time', 'Part-time', 'Contract'],
          isEnabled: true,
        },
      ],
    },
  },
  {
    id: 'task_board',
    name: 'Task Board',
    description: 'Manage project tasks from backlog to done.',
    defaultColumns: ['Backlog', 'To Do', 'In Progress', 'Review', 'Done'],
    schema: {
      attributes: [
        { id: 'title', name: 'Task', type: 'short_text', isEnabled: true, required: true },
        {
          id: 'status',
          name: 'Status',
          type: 'select',
          options: ['Backlog', 'To Do', 'In Progress', 'Review', 'Done'],
          isEnabled: true,
        },
        {
          id: 'priority',
          name: 'Priority',
          type: 'select',
          options: ['Low', 'Medium', 'High', 'Critical'],
          isEnabled: true,
        },
        { id: 'assignee', name: 'Assignee', type: 'short_text', isEnabled: true },
        { id: 'estimate', name: 'Time Estimate', type: 'short_text', isEnabled: true },
        { id: 'due_date', name: 'Due Date', type: 'date', isEnabled: true },
        { id: 'notes', name: 'Notes', type: 'markdown', isEnabled: true },
        {
          id: 'labels',
          name: 'Labels',
          type: 'select',
          options: ['Bug', 'Feature', 'Enhancement', 'Docs', 'Chore'],
          isEnabled: true,
        },
      ],
    },
  },
  {
    id: 'blank',
    name: 'Blank Canvas',
    description: 'Start fresh and define your own schema.',
    defaultColumns: ['Column 1', 'Column 2', 'Column 3'],
    schema: {
      attributes: [
        { id: 'title', name: 'Title', type: 'short_text', isEnabled: true, required: true },
        {
          id: 'status',
          name: 'Status',
          type: 'select',
          options: ['Column 1', 'Column 2', 'Column 3'],
          isEnabled: true,
        },
        { id: 'notes', name: 'Notes', type: 'markdown', isEnabled: true },
      ],
    },
  },
];
