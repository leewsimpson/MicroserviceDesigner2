namespace Options
{
    export class Project
    {
        showMarkDown?: boolean = true;
        showInfoIcons?: boolean = true;
        autoLayout?: boolean = true;
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
    }

    export function toggleViewInfoIcons(show: boolean)
    {
        _projectOptions.showInfoIcons = show;
        Main._diagram.layout = Util.getcurrentLayout();
    }

    export function toggleLayout(autolayout: boolean)
    {
        _projectOptions.autoLayout = autolayout;
        if (autolayout)
            Main._diagram.layout = Util.getcurrentLayout();
    }
}