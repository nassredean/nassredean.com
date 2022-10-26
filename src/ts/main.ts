import { MainScene } from './MainScene';

declare global {
	interface Window {
		isIE: boolean;
		isSP: boolean;
	}
}

class APP {
	private canvas: HTMLCanvasElement | null;

	constructor() {

		/*------------------------
			checkUA
		------------------------*/
		var ua = navigator.userAgent;
		window.isSP = ( ua.indexOf( 'iPhone' ) > 0 || ua.indexOf( 'iPod' ) > 0 || ua.indexOf( 'Android' ) > 0 && ua.indexOf( 'Mobile' ) > 0 || ua.indexOf( 'iPad' ) > 0 || ua.indexOf( 'Android' ) > 0 || ua.indexOf( 'macintosh' ) > 0 );
		window.isSP = window.isSP || navigator.platform == "iPad" || ( navigator.platform == "MacIntel" && navigator.userAgent.indexOf( "Safari" ) != - 1 && navigator.userAgent.indexOf( "Chrome" ) == - 1 && ( navigator as any ).standalone !== undefined );

		this.canvas = document.querySelector( "#container" );

		if (this.canvas) {
			 new MainScene(
				'Main',
				this.canvas
			);
		}
	}

}

window.addEventListener( 'load', ()=>{

	let app = new APP();

} );
