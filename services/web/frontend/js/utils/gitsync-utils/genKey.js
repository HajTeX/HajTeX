import nacl from "tweetnacl"
const bakeBufferString = (buffer) => {
    const combined = new Uint8Array(buffer.length + 1);
    combined.set(buffer);
    combined[buffer.length] = 0;
    return combined;
};

const bakeBuffer = (buffer) => {
    const lengthBuffer = new Uint8Array(4);
    const view = new DataView(lengthBuffer.buffer);
    view.setUint32(0, buffer.length, false); // Big-endian
    const combined = new Uint8Array(lengthBuffer.length + buffer.length);
    combined.set(lengthBuffer);
    combined.set(buffer, lengthBuffer.length);
    return combined;
};

const bakeUint32 = (data) => {
    const buffer = new Uint8Array(4);
    const view = new DataView(buffer.buffer);
    view.setUint32(0, data, false); // Big-endian
    return buffer;
};
const stringToUint8Array = (str) => {
    return new Uint8Array([...str].map((char) => char.charCodeAt(0)));
};


export const gen_openssh_key = () => {
    const keyPair = nacl.sign.keyPair();
    const publicKey = new Uint8Array(keyPair.publicKey);
    const privateKey = new Uint8Array(keyPair.secretKey);
    const buffer = [];

    buffer.push(bakeBufferString(new Uint8Array(stringToUint8Array("openssh-key-v1"))));
    buffer.push(bakeBuffer(new Uint8Array(stringToUint8Array("none"))));
    buffer.push(bakeBuffer(new Uint8Array(stringToUint8Array("none"))));
    buffer.push(bakeBuffer(new Uint8Array(0)));
    buffer.push(bakeUint32(1));

    const pubk_serialized = new Uint8Array(bakeBuffer(new Uint8Array(stringToUint8Array("ssh-ed25519", "utf-8"))).length +
        bakeBuffer(publicKey).length);
    pubk_serialized.set(bakeBuffer(new Uint8Array(stringToUint8Array("ssh-ed25519", "utf-8"))));
    pubk_serialized.set(bakeBuffer(publicKey), bakeBuffer(new Uint8Array(stringToUint8Array("ssh-ed25519", "utf-8"))).length);
    buffer.push(bakeBuffer(pubk_serialized));

    const prv = [];

    const rnd_4 = new Uint8Array(4);
    crypto.getRandomValues(rnd_4);
    prv.push(rnd_4, rnd_4);
    prv.push(bakeBuffer(new Uint8Array(stringToUint8Array("ssh-ed25519", "utf8"))));
    const privateKeyConcat = new Uint8Array(bakeBuffer(publicKey).length + bakeBuffer(privateKey).length);
    privateKeyConcat.set(bakeBuffer(publicKey));
    privateKeyConcat.set(bakeBuffer(privateKey), bakeBuffer(publicKey).length);
    prv.push(privateKeyConcat);
    prv.push(bakeBuffer(new Uint8Array(stringToUint8Array("", "utf8"))));

    let kPrivData = prv.reduce((acc, curr) => {
        const temp = new Uint8Array(acc.length + curr.length);
        temp.set(acc);
        temp.set(curr, acc.length);
        return temp;
    }, new Uint8Array(0));

    if (kPrivData.length % 8 !== 0) {
        const pad_len = 8 - (kPrivData.length % 8);
        const pad = new Uint8Array(pad_len);
        for (let i = 0; i < pad_len; i++) {
            pad[i] = i + 1;
        }
        const temp = new Uint8Array(kPrivData.length + pad.length);
        temp.set(kPrivData);
        temp.set(pad, kPrivData.length);
        kPrivData = temp;
    }

    buffer.push(bakeUint32(kPrivData.length));
    buffer.push(kPrivData);

    const outbuf = btoa(String.fromCharCode(...buffer.reduce((acc, curr) => {
        const temp = new Uint8Array(acc.length + curr.length);
        temp.set(acc);
        temp.set(curr, acc.length);
        return temp;
    }, new Uint8Array(0))));

    const priv_lines = [`-----BEGIN OPENSSH PRIVATE KEY-----`];
    for (let i = 0; i < outbuf.length; i += 70) {
        priv_lines.push(outbuf.slice(i, i + 70));
    }
    priv_lines.push(`-----END OPENSSH PRIVATE KEY-----`);

    return {
        publicKey: `ssh-ed25519 ${btoa(String.fromCharCode(...pubk_serialized))}`,
        privateKey: priv_lines.join("\n")
    };
};
