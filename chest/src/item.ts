import { ChestSystem, OpenableChest } from './chest'

export type Props = {
  onClick?: Actions
  onOpen?: Actions
  onClose?: Actions
}

const offsetX = 0.4
const offsetY = -0.15

export default class Chest implements IScript<Props> {
  instances: [Entity, Props, IChannel][] = []

  openClip = new AudioClip('sounds/openChest.mp3')
  closeClip = new AudioClip('sounds/closeChest.mp3')

  init() {
    engine.addSystem(new ChestSystem())
    Input.instance.subscribe(
      'BUTTON_DOWN',
      ActionButton.PRIMARY,
      true,
      event => {
        if (event.hit) {
          const entity = engine.entities[event.hit.entityId]
          for (const [top, props, channel] of this.instances) {
            if (top === entity) {
              channel.sendActions(props.onClick)
              break
            }
          }
        }
      }
    )
  }

  toggle(entity: Entity, value?: boolean, playSound = true) {
    const openable = entity.getComponent(OpenableChest)

    // compute new value
    if (value === true) {
      if (openable.isOpen) return
      openable.isOpen = true
    } else if (value === false) {
      if (!openable.isOpen) return
      openable.isOpen = false
    } else {
      openable.isOpen = !openable.isOpen
    }

    // Play sound
    if (playSound) {
      const clip = openable.isOpen ? this.openClip : this.closeClip
      const source = new AudioSource(clip)
      entity.addComponentOrReplace(source)
      source.playing = true
    }

    // start transition
    if (openable.transition === -1) {
      openable.transition = 0
    } else {
      openable.transition = 1 - openable.transition
    }
  }

  spawn(host: Entity, props: Props, channel: IChannel) {
    const pivot = new Entity('pivot')
    pivot.setParent(host)
    pivot.addComponent(
      new Transform({ position: new Vector3(0, -offsetY, -offsetX) })
    )
    pivot.addComponent(new OpenableChest(channel, props.onOpen, props.onClose))
    const base = new Entity('base')
    base.setParent(host)
    base.addComponent(new Transform({ position: new Vector3(0, 0, 0) }))
    base.addComponent(new GLTFShape('models/Chest_Base_01/Chest_Base_01.glb'))
    const top = new Entity('base')
    top.setParent(pivot)
    top.addComponent(
      new Transform({ position: new Vector3(0, offsetY, offsetX) })
    )
    top.addComponent(new GLTFShape('models/Chest_Top_01/Chest_Top_01.glb'))

    // add to list
    this.instances.push([top, props, channel])

    // handle click
    top.addComponent(new OnClick(() => channel.sendActions(props.onClick)))

    // handle actions
    channel.handleAction('open', () => this.toggle(pivot, true))
    channel.handleAction('close', () => this.toggle(pivot, false))
    channel.handleAction('toggle', () => this.toggle(pivot))

    // sync initial values
    channel.request<boolean>('isOpen', isOpen =>
      this.toggle(pivot, isOpen, false)
    )
    channel.reply<boolean>(
      'isOpen',
      () => pivot.getComponent(OpenableChest).isOpen
    )
  }
}
