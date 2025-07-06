export interface Task {
    key: string;
    icon: string;           // emoji to represent the task, supports one or two characters (if the user has choices)
    description?: string;   // an optional description of the task
}