"""Read a PyTorch zip checkpoint (state dict of tensors) into numpy, without torch."""
import pickle, zipfile, numpy as np, sys, collections

DT = {"FloatStorage": np.float32, "HalfStorage": np.float16, "DoubleStorage": np.float64, "LongStorage": np.int64, "IntStorage": np.int32, "BoolStorage": np.bool_}


def load(path):
    z = zipfile.ZipFile(path)
    names = z.namelist()
    pk = [n for n in names if n.endswith("data.pkl")][0]
    root = pk[: -len("data.pkl")]
    cache = {}

    class StorageType:
        def __init__(self, name): self.name = name

    def rebuild_tensor_v2(storage, offset, size, stride, *a):
        dt, key = storage
        if key not in cache:
            cache[key] = np.frombuffer(z.read(root + "data/" + key), dtype=dt)
        buf = cache[key]
        if len(size) == 0:
            return buf[offset].copy()
        itm = buf.itemsize
        arr = np.lib.stride_tricks.as_strided(buf[offset:], shape=tuple(size), strides=tuple(s * itm for s in stride))
        return np.array(arr)

    class U(pickle.Unpickler):
        def find_class(self, mod, name):
            if mod == "torch._utils" and name == "_rebuild_tensor_v2": return rebuild_tensor_v2
            if mod == "torch" and name.endswith("Storage"): return StorageType(name)
            if mod == "collections" and name == "OrderedDict": return collections.OrderedDict
            if mod == "torch._utils" and name == "_rebuild_parameter":
                return lambda data, req, hooks: data
            raise pickle.UnpicklingError(f"refusing {mod}.{name}")

        def persistent_load(self, pid):
            typ, st, key, loc, numel = pid
            assert typ == "storage"
            return (DT[st.name], key)

    return U(z.open(pk)).load()


if __name__ == "__main__":
    sd = load(sys.argv[1])
    if "state_dict" in sd: sd = sd["state_dict"]
    tot = 0
    for k, v in sd.items():
        tot += v.size
        print(k, v.shape, v.dtype)
    print("params", tot)
