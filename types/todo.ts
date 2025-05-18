export interface TodoTask {
    id: string;
    user_id: string;
    vehicle_id: string;
    task: string;
    priority: string;
    dueDate: string;
    notes: string;
    type: string;
    is_complete: boolean;
    inserted_at: string;
  }