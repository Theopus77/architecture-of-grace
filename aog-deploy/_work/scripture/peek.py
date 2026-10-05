import sys,numpy as np
from pocketsphinx import Decoder
from find import wav,SR
a=wav(sys.argv[1]); s0=float(sys.argv[2]); s1=float(sys.argv[3])
d=Decoder(samprate=SR); d.start_utt(); d.process_raw(a[int(s0*SR):int(s1*SR)].tobytes(),full_utt=True); d.end_utt()
print(" ".join(f"{s.word}@{s0+s.start_frame/100:.1f}" for s in d.seg()))
