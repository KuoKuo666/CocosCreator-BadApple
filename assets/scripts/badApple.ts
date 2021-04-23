
import { _decorator, Component, Node, resources, TextAsset, Label, Prefab, instantiate, Sprite, Color, AudioClip, Button, UITransform } from 'cc'

const { ccclass, property } = _decorator

@ccclass('BadApple')
export class BadApple extends Component {

    @property(Label)
    loadingTxtLabel!: Label

    @property(Label)
    loadingPointLabel!: Label

    @property(Button)
    startButton!: Button

    @property(Prefab)
    pointPrefab!: Prefab

    @property(AudioClip)
    audioClip!: AudioClip

    allTexts: string[][] = []
    points: Node[][] = []

    time: number = 0

    async start() {
        // 初始化 75 * 300 = 22500 的点阵屏幕，异步加载
        await this.initPointScreen()
        await this.initAllTextAssets()
        // 显示开始按钮
        this.startButton.node.active = true
    }

    renderVedio() {
        this.startButton.node.active = false

        let videoIndex = 0
        // 播放音乐
        this.audioClip.play()
        // 计时器开启
        this.schedule(() => {
            const textData = this.allTexts[videoIndex]
            if (!textData) { return }
            textData.forEach((lineText, index) => {
                for (let i = 0; i < lineText.length; i++) {
                    const sp = this.points[index][i].getComponent(Sprite)
                    sp && (sp.color = lineText[i] === '#' ? Color.WHITE : Color.BLACK)
                }
            })
            videoIndex += 1
        }, 1/10, 2190, 0)
    }

    async initPointScreen() {
        // 计数器，每次加载几个
        const countEveryDt = 30
        let count = 0
        // 横向 300 个，纵向 75 个，point 是 3 * 8
        for (let j = 0; j < 75; j++) {
            this.points[j] = []
            for (let i = 0; i < 300; i++) {
                const point = instantiate(this.pointPrefab)
                const x = -450 + i * 3 + 1.5
                const y = 300 - j * 8 - 4
                point.setPosition(x, y)
                this.points[j][i] = point
                this.node.addChild(point)

                count += 1
                if (count >= countEveryDt) {
                    count = 0
                    await this.waitOneDt()
                }
            }
            this.loadingPointLabel.string = `生成点阵中: ${j+1} / ${75}`
        }
        this.loadingPointLabel.string = ''
    }

    async initAllTextAssets() {
        const textAssetArr = []
        // 加载资源 2190 个 txt
        for (let i = 0; i < 2190; i++) {
            const textAsset = await this.loadTxtAsset(i)
            textAssetArr[i] = textAsset
            this.loadingTxtLabel.string = `帧数据: ${i+1} / 2190`
        }

        this.loadingTxtLabel.string = ''
        // 拿到帧数据文本数据，切割处理
        this.allTexts = textAssetArr.map(tAsset => {
            if (!tAsset) {
                return []
            }
            return tAsset.text.split('\n')
        })
    }

    waitOneDt() {
        return new Promise((resolve, reject) => {
            this.scheduleOnce(() => resolve(undefined), 0)
        })
    }

    loadTxtAsset(order: number) {
        return new Promise<TextAsset | undefined>((resolve, reject) => {
            resources.load(
                `txt/${order + 1}`,
                TextAsset,
                (err, text) => {
                    if (err) {
                        reject(undefined)
                    }
                    resolve(text)
                }
            )
        })
    }

}
