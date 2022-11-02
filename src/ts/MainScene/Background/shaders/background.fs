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
    vec3 col = sin(vec3(-.3,0.1,0.5)+fld.x-fld.y)*0.65+0.35;
	gl_FragColor = vec4(col,1.0);
}