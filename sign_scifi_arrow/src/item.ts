export type Props = {
  text?: string
  fontSize?: number
}

export default class SignPost implements IScript<Props> {
  init() {}

  spawn(host: Entity, props: Props, channel: IChannel) {
    const sign = new Entity()
    sign.setParent(host)

    sign.addComponent(new GLTFShape('models/signpost/Sign_Arrow.glb'))

    let signText = new Entity()
    signText.setParent(host)
    let text = new TextShape(props.text)
    text.fontSize = props.fontSize
    text.color = Color3.FromHexString('#8cfdff')
    text.outlineWidth = 0.4
    text.outlineColor = Color3.FromHexString('#8cfdff')

    text.width = 20
    text.height = 10
    text.hTextAlign = 'center'

    signText.addComponent(text)

    signText.addComponent(
      new Transform({
        position: new Vector3(0.25, 0.4, 0.025),
        rotation: Quaternion.Euler(0, 180, 0),
        scale: new Vector3(0.05, 0.05, 0.05)
      })
    )

    type ChangeTextType = { newText: string }
    channel.handleAction<ChangeTextType>('changeText', action => {
      text.value = action.values.newText
    })
  }
}
