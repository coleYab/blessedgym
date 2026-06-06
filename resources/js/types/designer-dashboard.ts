export type Designer = {
    id: number;
    name: string;
    role: string;
};

export type Stats = {
    active_projects: number;
    open_revisions: number;
    pending_approvals: number;
    completed_this_month: number;
};

export type Project = {
    project_code: string;
    client_name: string;
    stage: string;
    due_date: string;
    progress_percent: number;
};

export type Task = {
    id: number;
    title: string;
    project_code: string;
    category: string;
    time: string;
    completed: boolean;
};

export type SignOff = {
    project_code: string;
    designer: boolean;
    marketing: boolean;
    production_manager: boolean;
    coordinator: boolean;
};

export type DashboardNotification = {
    type: string;
    message: string;
    timestamp: string;
};

export type DesignerDashboardPageProps = {
    designer: Designer;
    stats: Stats;
    projects: Project[];
    tasks: Task[];
    sign_offs: SignOff[];
    notifications: DashboardNotification[];
};
