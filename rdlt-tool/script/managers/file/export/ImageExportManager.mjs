import { makeSVGElement } from "../../../render/builders/utils.mjs";
import { startURLDownload } from "../utils.mjs";

export default class ImageExportManager {
    /**
     * @param {SVGElement} sourceSVGElement 
     * @param {{ minX, minY, maxX, maxY }} bounds
     */
    static exportSVGToImage(filename, sourceSVGElement, bounds) {
        const { minX, minY, maxX, maxY } = bounds;
        const width = maxX - minX;
        const height = maxY - minY;

        console.log({ bounds, height, width });


        const svgElement = ImageExportManager.getDiagramElement(sourceSVGElement);
        svgElement.insertBefore(makeSVGElement("rect", {
            x: minX, y: minY, height, width, fill: "white"
        }), svgElement.firstChild);
        svgElement.setAttribute("viewBox", `${minX} ${minY} ${width} ${height}`);

        const svgData = new XMLSerializer().serializeToString(svgElement);
        const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
        const url = URL.createObjectURL(svgBlob);

        


        const img = new Image();
        img.onload = function () {
            const canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");
         
            ctx.drawImage(img, 0, 0);
            URL.revokeObjectURL(url);

            // Convert to PNG and trigger download
            const pngUrl = canvas.toDataURL("image/png");
            startURLDownload(filename, pngUrl);
        };

        img.src = url;
    }


    static getDiagramElement(rootElement) {
        const element = rootElement.cloneNode(false);
        const children = [...rootElement.children];

        for(const child of children) {
            if(child.classList.contains("diagram")) element.appendChild(child.cloneNode(true));
            else if(child.tagName === "g") element.appendChild(ImageExportManager.getDiagramElement(child));
        }

        return element;
    }
}