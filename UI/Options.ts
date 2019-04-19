namespace Options
{
    export class Project
    {
        showMarkDown?: boolean = true;
        showInfoIcons?: boolean = true;
    }

    export let _projectOptions = new Options.Project();

    export function toggleViewMarkup(show: boolean, diagramDiv: HTMLDivElement, editorDiv: HTMLDivElement)
    {
        _projectOptions.showMarkDown = show;
        editorDiv.hidden = !show;

        if (show)
        {
            diagramDiv.style.right = "30%";
        }
        else
        {
            diagramDiv.style.right = "0";
        }
       // Main._diagram.layout = Util.getcurrentLayout();
    }

    export function toggleViewInfoIcons(show: boolean)
    {
        _projectOptions.showInfoIcons = show;
       // Main._diagram.layout = Util.getcurrentLayout();
    }

    export function layout()
    {
        Main._diagram.layout = Util.getcurrentLayout();
    }
}