export type Props = {
  image: string
}

type ChangeTextType = { newText: string }

export default class SignPost implements IScript<Props> {
  init() {}

  spawn(host: Entity, props: Props, channel: IChannel) {
    const sign = new Entity()
    sign.setParent(host)

    sign.addComponent(new GLTFShape('models/Game_Cube_A.glb'))
    sign.addComponent(new Transform({}))

    let url = props.image

    let QRTexture = new Texture(url)
    let QRMaterial = new Material()
    QRMaterial.metallic = 0
    QRMaterial.roughness = 1
    QRMaterial.specularIntensity = 0
    QRMaterial.albedoTexture = QRTexture

    //modifying rotations after init. using Transform.rotate to finish rotation
    //something with Quaternion.Euler(x,y,z) y of certian values causing issues
    //when deployed from builder works great but when deployed with dcl deploy breaks
    //if they ever fix we can revert this file

    let QRPlane = new Entity()
    QRPlane.setParent(host)
    QRPlane.addComponent(new PlaneShape())
    QRPlane.addComponent(QRMaterial)
    QRPlane.addComponent(
      new Transform({
        position: new Vector3(-0.25, 0.97, -0.03),
        rotation: Quaternion.Euler(180, 0, 0),//was y=-15
        scale: new Vector3(.55, .55, .55),
      })
    )
    QRPlane.getComponent(Transform).rotate(Vector3.Down(), 15)

    let QRPlane2 = new Entity()
    QRPlane2.setParent(host)
    QRPlane2.addComponent(new PlaneShape())
    QRPlane2.addComponent(QRMaterial)
    QRPlane2.addComponent(
      new Transform({
        position: new Vector3(-0.4, 0.97, -0.61),
        rotation: Quaternion.Euler(180, 0, 0),//was y=165
        scale: new Vector3(.55,.55,.55),
      })
    )
    QRPlane2.getComponent(Transform).rotate(Vector3.Up(), 165)

    let QRPlane3 = new Entity()
    QRPlane3.setParent(host)
    QRPlane3.addComponent(new PlaneShape())
    QRPlane3.addComponent(QRMaterial)
    QRPlane3.addComponent(
      new Transform({
        position: new Vector3(-0.39, 2.265, -0.04),
        rotation: Quaternion.Euler(180, 0, 0),//was y=14.5
        scale: new Vector3(.55, .55, .55),
      })
    )
    QRPlane3.getComponent(Transform).rotate(Vector3.Up(), 14.5)

    let QRPlane4 = new Entity()
    QRPlane4.setParent(host)
    QRPlane4.addComponent(new PlaneShape())
    QRPlane4.addComponent(QRMaterial)
    QRPlane4.addComponent(
      new Transform({
        position: new Vector3(-0.23, 2.265, -0.602),
        rotation: Quaternion.Euler(180, 0, 0),//was y=193
        scale: new Vector3(.58, .58, .58),
      })
    )
    QRPlane4.getComponent(Transform).rotate(Vector3.Up(), 193)
  }
}