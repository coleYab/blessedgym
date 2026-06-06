export type ProjectListItem = {
    project_code: string;
    client_name: string;
    site_location: string | null;
    current_step: number;
    step_name: string;
    step_owner: string;
    step_status: 'pending' | 'in_progress' | 'done';
    assigned_date: string | null;
    due_date: string;
    is_overdue: boolean;
};

export type StageFilter = {
    value: string;
    label: string;
};

export type ProjectsPageFilters = {
    stage: string | null;
    status: string | null;
    search: string | null;
};

export type DesignerProjectsPageProps = {
    projects: ProjectListItem[];
    filters: ProjectsPageFilters;
    stages: StageFilter[];
};
