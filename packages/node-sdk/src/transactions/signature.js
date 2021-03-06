import crypto from "./crypto";
import constants from "../constants";
import transactionTypes from "../transaction-types";
import slots from "../time/slots";
import options from '../options';

function newSignature(secondSecret) {
	const keys = crypto.getKeys(secondSecret);

	const signature = {
		public_key: keys.public_key
	};

	return signature;
}

async function createSignature(secret, secondSecret, oldSecondSecret) {
    const keys = crypto.getKeys(secret);

    const signature = newSignature(secondSecret);

	const transaction = {
		type: transactionTypes.SIGNATURE,
		nethash: options.get('nethash'),
		amount: "0",    //Bignum update
		fee: constants.fees.secondsignature,
		recipient_id: null,
		sender_public_key: keys.public_key,
		timestamp: slots.getTime() - options.get('clientDriftSeconds'),
		asset: {
			signature
		}
    };

    await crypto.sign(transaction, keys);

    // FIXME: 这里的逻辑是要修改二次密码？不该使用old* 
	if (oldSecondSecret) {
	// if (secondSecret) {
        const secondKeys = crypto.getKeys(oldSecondSecret); 
        // const secondKeys = crypto.getKeys(secondSecret); 
		await crypto.secondSign(transaction, secondKeys); 
    }
    
    transaction.id = await crypto.getId(transaction);

	return transaction;
}

export default {
	createSignature
};
