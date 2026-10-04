# The Fender/Marshall treble-middle-bass tone stack, solved by nodal analysis, to check the published (Yeh & Smith 2006) coefficients
import sympy as sp
s,t,m,l,R1,R2,R3,R4,C1,C2,C3,Vi=sp.symbols('s t m l R1 R2 R3 R4 C1 C2 C3 Vi', positive=True)
A,W,B,X,M=sp.symbols('A W B X M')
Ra=(1-t)*R1; Rb=t*R1; Rl=l*R2; Rm=m*R3
eqs=[ (A-Vi)*s*C1+(A-W)/Ra,
      (W-A)/Ra+(W-B)/Rb,
      (B-W)/Rb+(B-X)*s*C2+(B-M)/Rl,
      (X-Vi)/R4+(X-B)*s*C2+(X-M)*s*C3,
      (M-B)/Rl+(M-X)*s*C3+M/Rm ]
sol=sp.solve(eqs,[A,W,B,X,M],dict=True)[0]
H=sp.simplify(sol[W]/Vi)
num,den=sp.fraction(sp.together(H))
num=sp.expand(num); den=sp.expand(den)
pn=sp.Poly(num,s); pd=sp.Poly(den,s)
# normalise so the s^0 term of the denominator is 1
d0=pd.coeff_monomial(1)
nb=[sp.simplify(sp.expand(pn.coeff_monomial(s**k)/d0)) for k in range(4)]
na=[sp.simplify(sp.expand(pd.coeff_monomial(s**k)/d0)) for k in range(4)]
# the published formulas
b1=t*C1*R1+m*C3*R3+l*(C1*R2+C2*R2)+(C1*R3+C2*R3)
b2=(t*(C1*C2*R1*R4+C1*C3*R1*R4)-m**2*(C1*C3*R3**2+C2*C3*R3**2)+m*(C1*C3*R1*R3+C1*C3*R3**2+C2*C3*R3**2)
    +l*(C1*C2*R1*R2+C1*C2*R2*R4+C1*C3*R2*R4)+l*m*(C1*C3*R2*R3+C2*C3*R2*R3)+(C1*C2*R1*R3+C1*C2*R3*R4+C1*C3*R3*R4))
b3=(l*m*(C1*C2*C3*R1*R2*R3+C1*C2*C3*R2*R3*R4)-m**2*(C1*C2*C3*R1*R3**2+C1*C2*C3*R3**2*R4)+m*(C1*C2*C3*R1*R3**2+C1*C2*C3*R3**2*R4)
    +t*C1*C2*C3*R1*R3*R4-t*m*C1*C2*C3*R1*R3*R4+t*l*C1*C2*C3*R1*R2*R4)
a1=(C1*R1+C1*R3+C2*R3+C2*R4+C3*R4)+m*C3*R3+l*(C1*R2+C2*R2)
a2=(m*(C1*C3*R1*R3-C2*C3*R3*R4+C1*C3*R3**2+C2*C3*R3**2)+l*m*(C1*C3*R2*R3+C2*C3*R2*R3)-m**2*(C1*C3*R3**2+C2*C3*R3**2)
    +l*(C1*C2*R2*R4+C1*C2*R1*R2+C1*C3*R2*R4+C2*C3*R2*R4)+(C1*C2*R1*R4+C1*C3*R1*R4+C1*C2*R3*R4+C1*C2*R1*R3+C1*C3*R3*R4+C2*C3*R3*R4))
a3=(l*m*(C1*C2*C3*R1*R2*R3+C1*C2*C3*R2*R3*R4)-m**2*(C1*C2*C3*R1*R3**2+C1*C2*C3*R3**2*R4)+m*(C1*C2*C3*R3**2*R4+C1*C2*C3*R1*R3**2-C1*C2*C3*R1*R3*R4)
    +l*C1*C2*C3*R1*R2*R4+C1*C2*C3*R1*R3*R4)
pub_b=[0,b1,b2,b3]; pub_a=[1,a1,a2,a3]
# the solved function is H = N/D with D0 normalised to 1 — but the published one has a0=1 in different scaling: compare as ratios
Hs=sum(nb[k]*s**k for k in range(4))/sum(na[k]*s**k for k in range(4))
Hp=sum(pub_b[k]*s**k for k in range(4))/sum(pub_a[k]*s**k for k in range(4))
import random
vals={R1:250e3,R2:1e6,R3:25e3,R4:56e3,C1:250e-12,C2:20e-9,C3:20e-9}
for trial in range(6):
    v=dict(vals); v[t]=random.uniform(0.05,0.95); v[m]=random.uniform(0.05,0.95); v[l]=random.uniform(0.05,0.95)
    for f in [50,300,1000,5000]:
        sv=2j*3.141592653589793*f
        a=complex(Hs.subs(v).subs(s,sv).evalf()); b=complex(Hp.subs(v).subs(s,sv).evalf())
        print(f"t={v[t]:.2f} m={v[m]:.2f} l={v[l]:.2f} f={f:5d}  solved {abs(a):.5f}  published {abs(b):.5f}  ratio {abs(a)/abs(b):.5f}")
print("numerator (s^0..3):", nb)
print("denominator (s^0..3):", na)
print("JS:")
def js(e): return sp.printing.jscode(sp.factor_terms(sp.expand(e)))
for k in range(1,4): print(f"b{k}=", js(nb[k]), ";")
for k in range(1,4): print(f"a{k}=", js(na[k]), ";")
