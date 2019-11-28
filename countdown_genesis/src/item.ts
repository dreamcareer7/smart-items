import { CountdownTimerComponent, CountdownTimerSystem } from './timer'

export type Props = {
  totalTime: number
  active: boolean
  onThreshold: Actions
  onTimeUp: Actions
}

type TimeValues = {
  seconds: number
}

type CountdownSync = {
  active: boolean
  currentTime: number
}

export default class Timer implements IScript<Props> {
  numberMaterial: Material

  init() {
    engine.addSystem(new CountdownTimerSystem())
  }

  updateBoard(entity: Entity, newValue: number, playSound = true) {}

  spawn(host: Entity, props: Props, channel: IChannel) {
    const board = new Entity()
    board.setParent(host)
    board.addComponent(
      new Transform({
        position: new Vector3(0, 0, 0)
      })
    )
    board.addComponent(new GLTFShape('models/CountdownTimerBase.glb'))

    const arrow = new Entity()
    arrow.setParent(host)
    arrow.addComponent(
      new Transform({
        rotation: Quaternion.Euler(90, 0, 0),
        position: new Vector3(0, 1, 0)
      })
    )

    arrow.addComponent(new GLTFShape('models/CountdownTimerPointer.glb'))

    let timeData = new CountdownTimerComponent(
      channel,
      props.totalTime,
      props.onTimeUp,
      props.onThreshold,
      props.active,
      arrow
    )

    board.addComponent(timeData)

    // handle actions
    const reset = () => {
      timeData.active = false
      timeData.currentTime = timeData.totalTime
      timeData.thresHoldReached = false
    }

    channel.handleAction<TimeValues>('addTime', e => {
      timeData.currentTime += e.values.seconds
      if (timeData.currentTime > timeData.totalTime / 3) {
        timeData.thresHoldReached = false
      }
    })
    channel.handleAction<TimeValues>('subtractTime', e => {
      timeData.currentTime -= e.values.seconds
    })
    channel.handleAction('reset', () => reset())
    channel.handleAction('activate', () => {
      reset()
      timeData.active = true
    })
    channel.handleAction('pause', () => {
      timeData.active = false
    })
    channel.handleAction('toggleActivate', () => {
      timeData.active != timeData.active
    })

    // sync initial values
    channel.request<CountdownSync>('countdown', count => {
      timeData.active = count.active
      timeData.currentTime = count.currentTime
    })
    channel.reply<CountdownSync>('countdown', () => {
      const { active, currentTime } = board.getComponent(
        CountdownTimerComponent
      )
      return { active, currentTime }
    })
  }
}
