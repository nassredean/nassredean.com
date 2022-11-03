import { MainScene } from './MainScene'

declare global {
  interface Window {
    isIE: boolean
    isSP: boolean
  }
}

class APP {
  private readonly canvas: HTMLCanvasElement | null

  constructor () {
    // Check user agent
    const ua = navigator.userAgent
    window.isSP = (ua.indexOf('iPhone') > 0 || ua.indexOf('iPod') > 0 || ua.indexOf('Android') > 0 && ua.indexOf('Mobile') > 0 || ua.indexOf('iPad') > 0 || ua.indexOf('Android') > 0 || ua.indexOf('macintosh') > 0)
    window.isSP = window.isSP || navigator.platform == 'iPad' || (navigator.platform == 'MacIntel' && navigator.userAgent.includes('Safari') && !navigator.userAgent.includes('Chrome') && (navigator as any).standalone !== undefined)

    this.canvas = document.querySelector('#container')

    if (this.canvas != null) {
      // eslint-disable-next-line no-new
      new MainScene('Main', this.canvas)
    }
  }
}

window.addEventListener('load', () => {
  // eslint-disable-next-line no-new
  new APP()
})
