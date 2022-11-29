uniform float time;

varying vec2 vUv;
varying vec3 vPosition;

float f(in vec2 p)
{
    return sin(p.x+sin(p.y+time*0.1)) * sin(p.y*p.x*0.1+time*0.2);
}

vec2 field(in vec2 p)
{
	vec2 ep = vec2(.05,0.);
    vec2 rz= vec2(0);
	for( int i=0; i<7; i++ )
	{
		float t0 = f(p);
		float t1 = f(p + ep.xy);
		float t2 = f(p + ep.yx);
        vec2 g = vec2((t1-t0), (t2-t0))/ep.xx;
		vec2 t = vec2(-g.y,g.x);
        
        p += .5*t + g*.3;
        rz= t;
	}
    
    return rz;
}

void main()
{
    vec2 p = vPosition.xy / vec2(6., 6.);

    vec2 fld = field(p);
    float fs = sin(fld.x - fld.y) / 2. + .5;
    // vec3 baseFirst = vec3(0.,0.475,0.949);
    // vec3 accent = vec3(0., 0., 0.);
    // vec3 baseSecond = vec3(0.,0.149,0.298);
    // vec3 baseColor = mix(baseFirst,baseSecond,fs);
    // vec3 secondBaseColor = mix(baseColor,accent,fs);

	gl_FragColor = vec4(vec3(pow(fs, 6.0)),1.0);
	// gl_FragColor = vec4(secondBaseColor,1.0);
}