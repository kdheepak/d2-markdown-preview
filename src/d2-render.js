
const os = require('os');
const fs = require('fs');
const { execSync } = require('child_process');

class D2Viz {
    renderString(source: string) {
        // Generate a unique file name
        const now = `${Date.now()}`;
        const tmpInFile = `${os.tmpdir()}/d2-${now}.d2`;
        const tmpOutFile = `${os.tmpdir()}/d2-${now}.svg`;

        // Write to the temporary file
        fs.writeFileSync(tmpInFile, source, 'utf8');

        execSync(`d2 ${tmpInFile} ${tmpOutFile}`, { stdio: 'inherit' });
        const contents = fs.readFileSync(tmpOutFile, 'utf8');
        return contents;
    }
}

function contentLoaded() {
    console.log("Content loaded");
    var viz = new D2Viz();
    var d2Elements = document.getElementsByClassName('d2');
    console.log(d2Elements)
    var changes = [];

    for (let index = 0; index < d2Elements.length; index++) {
        var element = d2Elements.item(index);
        var source = element?.textContent;

        changes.push({
            placeholder: element?.parentElement?.parentElement,
            svg: viz.renderString(source ? source : "")
        });
    }

    for (let index = 0; index < changes.length; index++) {
        const change = changes[index];
        // @ts-ignore
        change.svg.then(svg=> {
            // @ts-ignore
            change.placeholder.outerHTML = svg;
        });
    }

    // use to debug rendered code.
    // document.body.appendChild(document.createTextNode(document.body.innerHTML));
}

window.addEventListener('load', function () {
    console.log("####################")
    contentLoaded();
}, false);