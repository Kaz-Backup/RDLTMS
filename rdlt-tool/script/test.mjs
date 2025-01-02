import App from "./App.mjs";
import ModelArc from "./entities/model/ModelArc.mjs";
import ModelComponent from "./entities/model/ModelComponent.mjs";
import RDLTModel from "./entities/model/RDLTModel.mjs";
import SVGAssetsRepository from "./render/builders/SVGAssetsRepository.mjs";


async function start() {
    // console.log("Starting app...");
    // await App.initialize();

    
    // console.log("Loading SVG assets...");
    // await SVGAssetsRepository.initialize();
        
    // console.log("App is ready.");

    // console.log(SVGAssetsRepository.cache);

    const model = new RDLTModel();
    const x1 = model.addComponent(new ModelComponent({ identifier: "X1", type: "boundary" }));
    const x2 = model.addComponent(new ModelComponent({ identifier: "X2", type: "controller" }));
    const x3 = model.addComponent(new ModelComponent({ identifier: "X3", type: "entity" }));

    const a1_1 = model.addArc(ModelArc.create(x1.uid, x1.uid));
    const a1_2 = model.addArc(ModelArc.create(x1.uid, x2.uid));
    const a1_3 = model.addArc(ModelArc.create(x1.uid, x3.uid));
    const a2_3a = model.addArc(ModelArc.create(x2.uid, x3.uid));
    const a2_3b = model.addArc(ModelArc.create(x2.uid, x3.uid));
    const a3_3 = model.addArc(ModelArc.create(x3.uid, x3.uid));
    const a3_1 = model.addArc(ModelArc.create(x3.uid, x1.uid));

    console.log(model.getComponent(x1.uid));
    console.log(model.getArc(a2_3a.uid));
    model.removeArc(a2_3b.uid);
    model.removeComponent(x1.uid);
}

start();