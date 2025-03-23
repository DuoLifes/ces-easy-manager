export interface IMenus {
    id: string;
    pid?: string;
    icon?: string;
    index: string;
    title: string;
    permiss?: string;
    children?: IMenus[];
}

export class Menus implements IMenus {
    id: string;
    pid?: string;
    icon?: string;
    index: string;
    title: string;
    permiss?: string;
    children?: Menus[];

    constructor(data: IMenus) {
        this.id = data.id;
        this.pid = data.pid;
        this.icon = data.icon;
        this.index = data.index;
        this.title = data.title;
        this.permiss = data.permiss;
        this.children = data.children?.map(child => new Menus(child));
    }
}