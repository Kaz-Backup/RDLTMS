import App from "./App.mjs";
import ComponentGeometry from "./entities/geometry/ComponentGeometry.mjs";
import VisualComponent from "./entities/model/visual/VisualComponent.mjs";

async function test() {
    console.log("Testing app...");

    const modellingManager = App.contexts[0].managers.modelling;
    
    // const x1 = modellingManager.addComponent("boundary", 
    //     { identifier: "x1", label: "Boundary 1" },
    //     new ComponentGeometry({ position: { x: 100, y: 100 }})
    // );

    // const x2 = modellingManager.addComponent("controller", 
    //     { identifier: "x2" }, 
    //     new ComponentGeometry({ position: { x: 300, y: 200 }}) 
    // );

    // const x3 = modellingManager.addComponent("entity", 
    //     { identifier: "x3" }, 
    //     new ComponentGeometry({ position: { x: 150, y: 350 }}) 
    // );

    // const a1_2 = modellingManager.addArc(x1.uid, x2.uid, { C: 'a', L: 5 });
    // modellingManager.addArc(x3.uid, x2.uid, { C: 'b', L: 5 });


};

setTimeout(() => test(), 500);