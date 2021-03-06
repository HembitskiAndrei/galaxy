import {TransformNode} from "@babylonjs/core/Meshes/transformNode";
import {Mesh} from "@babylonjs/core/Meshes/mesh";
import {MeshBuilder} from "@babylonjs/core/Meshes/meshBuilder";
import {Vector3} from "@babylonjs/core/Maths/math.vector";
import {PBRMaterial} from "@babylonjs/core/Materials/PBR/pbrMaterial";
import {MainScene} from "../scenes/MainScene";
import {Texture} from "@babylonjs/core/Materials/Textures/texture";
import {GalaxyMaterial} from "./materials/GalaxyMaterial";
import {CONFIG_SPIRAL_GALAXY_MATERIAL} from "./materials/configsGalaxiesMaterial";
import {AbstractMesh} from "@babylonjs/core/Meshes/abstractMesh";
import {UtilityLayerRenderer} from "@babylonjs/core/Rendering/utilityLayerRenderer";

export class SpiralGalaxy {
  name: string;
  readonly coreTransformNode: TransformNode;
  solarSystem: TransformNode;
  planeLocalArm: AbstractMesh;
  planeSolarSystem: Mesh;
  planeTargetSolarSystem: Mesh;
  private readonly scene: MainScene;
  private readonly materialsForGalaxy: GalaxyMaterial[];

  constructor(name: string, scene: MainScene) {
    this.name = name;
    this.scene = scene;
    this.coreTransformNode = new TransformNode("coreTransformNode", this.scene);
    this.coreTransformNode.addRotation(0, -Math.PI / 4, 0);

    this.AddMeshesForGUI();

    this.materialsForGalaxy = [];
    for(let i = 0; i < 4; i++) {
      this.materialsForGalaxy.push(new GalaxyMaterial(`SpiralGalaxyMaterial-${i}`, this.scene, CONFIG_SPIRAL_GALAXY_MATERIAL));
    }

    const meshTaskGalaxy = this.scene.assetsManager.addContainerTask(
      "galaxyTask",
      "",
      "./assets/meshes/",
      "galaxy1.glb",
    );
    meshTaskGalaxy.onSuccess = task => {
      const deltaY = 0;
      const meshes = task.loadedContainer.instantiateModelsToScene(name => `${name}-1`, false).rootNodes[0].getChildMeshes();
      for(let i = 1; i < 5; i++) {
        const galaxyMesh = meshes[i];
        galaxyMesh.position.y += deltaY;
        const originalMat = <PBRMaterial>galaxyMesh.material;
        const customMaterial =  this.materialsForGalaxy[i - 1];
        customMaterial.albedoTexture = originalMat.albedoTexture;
        customMaterial.emissiveTexture = originalMat.emissiveTexture;
        galaxyMesh.material = customMaterial;
        galaxyMesh.parent = this.coreTransformNode;
      }
      this.planeLocalArm = meshes[0];
      this.planeLocalArm.renderingGroupId = 2;
      this.planeLocalArm.parent = this.coreTransformNode;
      this.planeLocalArm.position.y += deltaY;
    };
  }

  AddMeshesForGUI() {
    this.solarSystem = new TransformNode("node", this.scene);
    this.solarSystem.position = new Vector3(-35, 0, 30);
    this.solarSystem.parent = this.coreTransformNode;

    const utilLayer = new UtilityLayerRenderer(this.scene, false);
    this.planeSolarSystem = MeshBuilder.CreatePlane("planeLabel", { width: 80, height: 40 }, utilLayer.utilityLayerScene);
    this.planeSolarSystem.renderingGroupId = 2;
    this.planeSolarSystem.billboardMode = Mesh.BILLBOARDMODE_ALL;
    this.planeSolarSystem.position = new Vector3(-80, -20, 40);
    this.planeSolarSystem.parent = this.solarSystem;

    this.planeTargetSolarSystem = Mesh.CreatePlane("planeTargetSolarSystem", 4, utilLayer.utilityLayerScene);
    this.planeTargetSolarSystem.renderingGroupId = 2;
    this.planeTargetSolarSystem.position = new Vector3(0, 0, 0);
    this.planeTargetSolarSystem.billboardMode = Mesh.BILLBOARDMODE_ALL;
    this.planeTargetSolarSystem.parent = this.solarSystem;
  }

  SetNoiseTexture(texture: Texture) {
    this.materialsForGalaxy.forEach(material => {
      material.setTexture(texture);
    })
  }
}
