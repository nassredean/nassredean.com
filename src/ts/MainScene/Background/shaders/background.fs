uniform float time;

varying vec2 vUv;

void main()	{
	gl_FragColor = vec4((sin(time) + 1.) / 2.,0.0, 0.0, 1.0);
}
