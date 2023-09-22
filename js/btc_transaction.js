$(function () {
    // Add new VIN
    $('#addVin').click(function () {
        var vin = `
            <div class="vin">
                <div class="form-group">
                    <label for="vinTxHash">Transaction Hash:</label>
                    <input type="text" class="form-control" id="vinTxHash" name="vinTxHash">
                </div>
                <div class="form-group">
                    <label for="vinTxIndex">Transaction Index:</label>
                    <input type="text" class="form-control" id="vinTxIndex" name="vinTxIndex">
                </div>
            </div>
        `;
        $('#vins').append(vin);
    });

    // Add new VOUT
    $('#addVout').click(function () {
        var vout = `
            <div class="vout">
                <div class="form-group">
                    <label for="voutAddress">To Address:</label>
                    <input type="text" class="form-control" id="voutAddress" name="voutAddress">
                </div>
                <div class="form-group">
                    <label for="voutAmount">Amount(Satoshi):</label>
                    <input type="text" class="form-control" id="voutAmount" name="voutAmount">
                </div>
            </div>
        `;
        $('#vouts').append(vout);
    });

    // Sign transaction
    $('#signTransaction').click(function () {
        try {
            // Fetch form data
            const addressPrefix = $('#addressPrefix').val();
            const privateKey = $('#privateKey').val();
            const vinTxHashes = $('input[name="vinTxHash"]').map(function () { return $(this).val(); }).get();
            const vinTxIndexes = $('input[name="vinTxIndex"]').map(function () { return $(this).val(); }).get();
            const voutAddresses = $('input[name="voutAddress"]').map(function () { return $(this).val(); }).get();
            const voutAmounts = $('input[name="voutAmount"]').map(function () { return $(this).val(); }).get();

            // Create a transaction
            const myNetwork = {
                messagePrefix: '\x18Bitcoin Signed Message:\n',
                bech32: 'bc',
                bip32: {
                    public: 0x0488b21e,
                    private: 0x0488ade4,
                },
                pubKeyHash: Number(addressPrefix), // 这是你的公钥哈希前缀
                scriptHash: 5, // 这是你的脚本哈希前缀
                wif: 128, // 这是你的WIF格式私钥的前缀
            };
            const keyPair = bitcoin.ECPair.fromPrivateKey(
                Buffer.from(privateKey, 'hex'),
                { compressed: true, network: myNetwork }
            );

            console.log("start init builder")
            const txb = new bitcoin.TransactionBuilder(myNetwork);
            txb.setVersion(1);
            for (let i = 0; i < vinTxHashes.length; i++) {
                if (vinTxHashes[i] == "" || vinTxIndexes[i] == "") {
                    continue;
                }
                txb.addInput(vinTxHashes[i], Number(vinTxIndexes[i]));
            }
            for (let i = 0; i < voutAddresses.length; i++) {
                if (voutAddresses[i] == "" || voutAmounts[i] == "") {
                    continue;
                }
                txb.addOutput(voutAddresses[i], Number(voutAmounts[i]));
            }

            // Sign the transaction
            for (let i = 0; i < vinTxHashes.length; i++) {
                if (vinTxHashes[i] == "" || vinTxIndexes[i] == "") {
                    continue;
                }
                txb.sign(i, keyPair);
            }

            // Build the transaction
            const tx = txb.build();
            const txHex = tx.toHex();

            // Display the transaction hex
            alert("Please copy the raw transaction hex on broadcast page and broadcast it.");
            $('#rawData').val(txHex);
        } catch (e) {
            alert(e);
        }
    });

    // Broadcast transaction
    $('#broadcastTransaction').click(function () {
        // TODO: Broadcast transaction using bitcoinjs-lib
        alert("Not implemented yet.")
    });
});

// Generate address
$('#generateAddress').click(function () {
    try {
        // Prevent default action
        event.preventDefault();

        // Fetch form data
        const privateKey = $('#privateKey').val();
        const addressPrefix = $('#addressPrefix').val();

        console.log(privateKey);
        console.log(addressPrefix);

        // Generate key pair from private key
        const keyPair = bitcoin.ECPair.fromPrivateKey(Buffer.from(privateKey, 'hex'), { compressed: true });

        // Generate address from key pair
        const { address } = bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey, network: { pubKeyHash: addressPrefix } });

        console.log(address);
        // Display the generated address
        $('#generatedAddress').val(address);
    } catch (e) {
        alert(e);
    }
});

// Generate private key
$('#generatePrivateKey').click(function (event) {
    try {
        // Prevent default action
        event.preventDefault();
        // Generate a new key pair
        const keyPair = bitcoin.ECPair.makeRandom();
        // Get the private key from the key pair
        const privateKey = keyPair.privateKey.toString('hex');
        // Display the generated private key
        $('#generatedPrivateKey').val(privateKey);
    } catch (e) {
        alert(e);
    }
});