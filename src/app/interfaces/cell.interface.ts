export interface Cell {
    alive: boolean;
    color: Color | null;
}

export interface Color {
    r: number;
    g: number;
    b: number;
}