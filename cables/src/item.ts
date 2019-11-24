import { CableBox } from './cables'


export type Props = {
	redCable: boolean
	greenCable: boolean
	blueCable: boolean
	onClick?: Actions
	onRedCut?: Actions
	onGreenCut?: Actions
	onBlueCut?: Actions
	onBoxOpen?: Actions
	onBoxClose?: Actions
}

export enum CableColors {
	Blue,
	Green,
	Red
  }


export default class Cables implements IScript<Props> {
  openClip = new AudioClip('sounds/Chest_Open.mp3')
  closeClip = new AudioClip('sounds/Chest_Close.mp3')
  //cableClip = new AudioClip()

//   open: Record<string, boolean> = {}
//   redCableCut: Record<string, boolean> = {}
//   greenCableCut: Record<string, boolean> = {}
//   blueCableCut: Record<string, boolean> = {}

  init() {}

  toggleBox(entity: Entity, value: boolean, playSound = true) {
	let boxState = entity.getComponent(CableBox)
	if (boxState.doorOpen === value) return

    if (playSound) {
	   const source = value? new AudioSource(this.openClip) : new AudioSource(this.closeClip)       
	   entity.addComponentOrReplace(source)
	   source.volume = 0.3
       source.playing = true
    }

    const animator = entity.getComponent(Animator)
	const openClip = new AnimationState('open', { looping: false })
	const closeClip = new AnimationState('close', { looping: false })
	animator.addClip(openClip)
	animator.addClip(closeClip)
    openClip.stop()
    closeClip.stop()
    const clip = value ? openClip : closeClip
    clip.play()

    boxState.doorOpen = value
  }



  toggleCable(entity: Entity, value: boolean, color: CableColors, playSound = true) {
	let boxState = entity.getParent().getComponent(CableBox)
	if (playSound) {
		//   const source = new AudioSource(this.clip)
		//   entity.addComponentOrReplace(source)
		//   source.playing = true
	}
	const animator = entity.getComponent(Animator)
	let cableClip: AnimationState
	
	switch (color){
		case  CableColors.Red:
			if (boxState.redCableCut === value) return  
			cableClip = new AnimationState('CableRedAction', { looping: false })
			animator.addClip(cableClip)
			boxState.redCableCut = value
			break
		
		case CableColors.Green:
			if (boxState.greenCableCut === value) return
			cableClip = new AnimationState('CableGreenAction', { looping: false })
			animator.addClip(cableClip)
			boxState.greenCableCut = value
			break

		case CableColors.Blue:
			if (boxState.blueCableCut === value) return
			cableClip = new AnimationState('CableBlueAction', { looping: false })
			animator.addClip(cableClip)
			boxState.blueCableCut = value
			break
	}

	if (value){
		cableClip.play()
	  } else {
		cableClip.stop()
	  }

  }

  spawn(host: Entity, props: Props, channel: IChannel) {
    const box = new Entity()
	box.setParent(host)
	let boxState = new CableBox(
		channel,
		props.redCable,
		props.greenCable,
		props.blueCable,
	)
	box.addComponent(boxState)

    const animator = new Animator()
	const openClip = new AnimationState("open", {looping: false})
	const closeClip = new AnimationState("close", {looping: false})
    animator.addClip(openClip)
    animator.addClip(closeClip)
	box.addComponent(animator)
	
	box.addComponent(new GLTFShape('models/Cable_Box.glb'))
	box.addComponent(new Transform({
		position: new Vector3(0,0,0),
		scale: new Vector3(0.3, 0.3, 0.3)
	}))

    box.addComponent(
      new OnPointerDown(e => {
		if (e.hit.length > 4) return
        channel.sendActions(props.onClick)
      })
    )
	const redCable = new Entity()
	redCable.setParent(box)
	if (props.redCable){	
		redCable.addComponent(new Transform({
			position: new Vector3(-0.21,0.15,0)
		}))
		const redClip = new AnimationState("CableRedAction", {looping: false})
		redCable.addComponent(new Animator()).addClip(redClip)
		redCable.addComponent(new GLTFShape("models/RedCable.glb"))
		redCable.addComponent(new OnPointerDown( e=> {
			if (e.hit.length > 4) return
			if (boxState.redCableCut === true) return
			const action = channel.createAction('redCut', {})
			channel.sendActions([action])
		} ))	
	}

	const greenCable = new Entity()
	greenCable.setParent(box)
	if (props.greenCable){
		greenCable.addComponent(new Transform({
			position: new Vector3(0,0.15,0)
		}))
		const greenClip = new AnimationState("CableGreenAction", {looping: false})
		greenCable.addComponent(new Animator()).addClip(greenClip)
		greenCable.addComponent(new GLTFShape("models/GreenCable.glb"))
		greenCable.addComponent(new OnPointerDown( e=> {
			if (e.hit.length > 4) return
			if (boxState.greenCableCut === true) return
			const action = channel.createAction('greenCut', {})
			channel.sendActions([action])
		} ))
	}

	const blueCable = new Entity()
	blueCable.setParent(box)
	if (props.blueCable){
		blueCable.addComponent(new Transform({
			position: new Vector3(0.21,0.15,0)
		}))
		const blueClip = new AnimationState("CableBlueAction", {looping: false})
		blueCable.addComponent(new Animator()).addClip(blueClip)
		blueCable.addComponent(new GLTFShape("models/BlueCable.glb"))
		blueCable.addComponent(new OnPointerDown( e=> {
			if (e.hit.length > 4) return
			if (boxState.blueCableCut === true) return
			const action = channel.createAction('blueCut', {})
			channel.sendActions([action])
		} ))
	}


	// background surface (to avoid closing the door when missing cables)
	// let backroundMaterial = new Material()
	// backroundMaterial.albedoColor = Color3.FromHexString("#1C1C1C")
	// backroundMaterial.metallic = 0

	// let background = new Entity()
	// background.addComponent(new PlaneShape())
	// background.setParent(host)
	// background.addComponent(new Transform({
	// 	position: new Vector3(0,0,0.01),
	// 	rotation: Quaternion.Euler(0,0,0),
	// 	scale: new Vector3(0.35, 0.4, 0.35)
	// }))
	// background.addComponent(backroundMaterial)

    // handle actions
    channel.handleAction('openBox', ({ sender }) => {
	  this.toggleBox(box, true)
      if (sender === channel.id) {
        channel.sendActions(props.onBoxOpen)
      }
    })
    channel.handleAction('closeBox', ({ sender }) => {
	  this.toggleBox(box, false)
      if (sender === channel.id) {
        channel.sendActions(props.onBoxClose)
      }
	})
	channel.handleAction('toggleBox', ({ sender }) => {
		let newState = !boxState.doorOpen
		this.toggleBox(box, newState)
		if (sender === channel.id) {
		  if (newState){
			channel.sendActions(props.onBoxOpen)
		  } else {
			channel.sendActions(props.onBoxClose)
		  } 
		}
	  })
	  channel.handleAction('redCut', ({ sender }) => {
		this.toggleCable(redCable, true, CableColors.Red)
		if (sender === channel.id) {
			channel.sendActions(props.onRedCut)
		}
	  })
	  channel.handleAction('greenCut', ({ sender }) => {
		this.toggleCable(greenCable, true, CableColors.Green)
		if (sender === channel.id) {
			channel.sendActions(props.onGreenCut)
		  }
	  })
	  channel.handleAction('blueCut', ({ sender }) => {
		this.toggleCable(blueCable, true, CableColors.Blue)
		if (sender === channel.id) {
			channel.sendActions(props.onBlueCut)
		}
	  })

	channel.handleAction('reset', ({ sender }) => {
		this.toggleCable(redCable, false, CableColors.Red)
		this.toggleCable(blueCable, false, CableColors.Blue)
		this.toggleCable(greenCable, false, CableColors.Green)
		this.toggleBox(box, false)
	})

    // sync initial values
    channel.request<boolean[]>('isActive', state => {
	  this.toggleBox(box, state[0], false)
	  this.toggleCable(redCable, state[1], CableColors.Red)
	  this.toggleCable(greenCable, state[2], CableColors.Green)
	  this.toggleCable(blueCable, state[3], CableColors.Blue)
	})
	channel.reply<boolean[]>('isActive', () => 
	[
		boxState.doorOpen, 
		boxState.redCableCut, 
		boxState.greenCableCut, 
		boxState.blueCableCut
	]
	)
  }
}
