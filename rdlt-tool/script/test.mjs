import App from "./App.mjs";
import ComponentGeometry from "./entities/geometry/ComponentGeometry.mjs";
import VisualComponent from "./entities/model/visual/VisualComponent.mjs";

async function test() {
    console.log("Testing app...");

    const modellingManager = App.contexts[0].managers.modelling;
    modellingManager.addComponent("boundary", 
        { identifier: "x1", label: "Boundary 1" }
    );

    modellingManager.addComponent("controller", 
        { identifier: "x2" }, 
        new ComponentGeometry({ position: { x: 100, y: 100 }}) 
    );
};

setTimeout(() => test(), 100);