const test = require('tape');

const {pkWithDoc} = require('../lib/load');

const testGroup = "Graph Succinct Block";

const pk = pkWithDoc("../test_data/usx/web_rut_1.usx", "eng", "ust")[0];
const pk2 = pkWithDoc("../test_data/usfm/footnote.usfm", "eng", "ust")[0];

const itemFragment = '{ ... on Token { itemType subType chars } ... on Scope { itemType label } ... on Graft { itemType subType sequenceId } }';

const checkLengthResult = async (t, query, lengths) => {
    const result = await pk.gqlQuery(query);
    t.ok("data" in result);
    t.ok("succinctBlocks" in result.data.documents[0].mainSequence);
    for (const blockNo of [0, 1]) {
        const block = result.data.documents[0].mainSequence.succinctBlocks[blockNo];
        for (const [field, value] of Object.entries(lengths[blockNo])) {
            t.equal(block[field], value);
        }
    }
}

test(
    `Byte Length (${testGroup})`,
    async function (t) {
        try {
            const lengths = [
                {
                    cBL: 1734,
                    bgBL: 9,
                    osBL: 0,
                    isBL: 57
                },
                {
                    cBL: 198,
                    bgBL: 0,
                    osBL: 9,
                    isBL: 6
                }
            ];
            t.plan(2 + (lengths.length * Object.keys(lengths[0]).length));
            const query = '{ documents { mainSequence { succinctBlocks { cBL bgBL osBL isBL } } } }';
            await checkLengthResult(t, query, lengths);
        } catch (err) {
            console.log(err)
        }
    }
);

test(
    `Length in Items (${testGroup})`,
    async function (t) {
        try {
            const lengths = [
                {
                    cL: 578,
                    bgL: 3,
                    osL: 0,
                    isL: 19
                },
                {
                    cL: 66,
                    bgL: 0,
                    osL: 3,
                    isL: 2
                }
            ];
            t.plan(2 + (lengths.length * Object.keys(lengths[0]).length));
            const query = '{ documents { mainSequence { succinctBlocks { cL bgL osL isL } } } }';
            await checkLengthResult(t, query, lengths);
        } catch (err) {
            console.log(err)
        }
    }
);

test(
    `Unpacked Scope & Graft Fields (${testGroup})`,
    async function (t) {
        try {
            const lengths = [
                {
                    bg: 3,
                    os: 0,
                    is: 19
                },
                {
                    bg: 0,
                    os: 3,
                    is: 2
                }
          ];
            t.plan(4 + (lengths.length * Object.keys(lengths[0]).length));
            const query = '{ documents { mainSequence { succinctBlocks { is { label } os { label } bs { label } bg { subType }  } } } }';
            const result = await pk.gqlQuery(query);
            t.ok("data" in result);
            t.ok("succinctBlocks" in result.data.documents[0].mainSequence);
            for (const blockNo of [0, 1]) {
                const block = result.data.documents[0].mainSequence.succinctBlocks[blockNo];
                t.equal(block.bs.label, "blockTag/p");
                for (const [field, value] of Object.entries(lengths[blockNo])) {
                    t.equal(block[field].length, value);
                }
            }
        } catch (err) {
            console.log(err)
        }
    }
);

test(
    `Items (${testGroup})`,
    async function (t) {
        try {
            t.plan(2);
            const query = `{ documents { mainSequence { succinctBlocks { items ${itemFragment} } } } }`;
            const result = await pk2.gqlQuery(query);
            t.ok("data" in result);
            t.ok("succinctBlocks" in result.data.documents[0].mainSequence);
            // console.log(JSON.stringify(result.data, null, 2));
        } catch (err) {
            console.log(err)
        }
    }
);
