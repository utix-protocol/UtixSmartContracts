import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { fromPromise } from 'rxjs/observable/fromPromise';
import { Web3Service } from './web3.service'

const crowdsale = require('../../build/contracts/MintedTokenCappedCrowdsaleExt.json');
const token = require('../../build/contracts/CrowdsaleTokenExt.json');
const contract = require('truffle-contract');

@Injectable()
export class MetaCoinService {

	crowdsale = contract(crowdsale);
	token = contract(token);
	constructor(
		private web3Ser: Web3Service, ) {
		// Bootstrap the MetaCoin abstraction for Use
		this.crowdsale.setProvider(web3Ser.web3.currentProvider);
	}

	getWhiteListCount(): Observable<number> {
		let meta;
		return Observable.create(observer => {
			this.crowdsale
				.deployed()
				.then(instance => {
					meta = instance;
					//we use call here so the call doesn't try and write, making it free
					return meta.whitelistedParticipantsLength.call();
				})
				.then(value => {
					observer.next(value)
					observer.complete()
				})
				.catch(e => {
					console.log(e);
					observer.error(e)
				});
		})
	}

	sendCoin(): Observable<any> {
		debugger;
		let meta;
		return Observable.create(observer => {
			this.crowdsale
				.deployed()
				.then(instance => {
					meta = instance;
					const minCap = 1 * 10 ** 18
					const maxCap = 10 * 10 ** 18
					return meta.setEarlyParticipantWhitelist("0xa16d91f31ac922fd0d8446573eccae932f7bd76c", true, minCap, maxCap, { from: "0x80fC8426A472Dd0b07EEd8D893c7B71657af096d" });

				})
				.then(() => {
					observer.next()
					observer.next()
				})
				.catch(e => {
					console.log(e);
					observer.error(e)
				});
		})
		//0xa16d91f31ac922fd0d8446573eccae932f7bd76c
	}
	transferOwnerShip(): Observable<any> {
		debugger;
		let meta;
		return Observable.create(observer => {
			this.token
				.deployed()
				.then(instance => {
					meta = instance;
					const minCap = 1 * 10 ** 18
					const maxCap = 10 * 10 ** 18
					return meta.transferOwnership("0xa16d91f31ac922fd0d8446573eccae932f7bd76c", { from: "0x80fC8426A472Dd0b07EEd8D893c7B71657af096d" });
				})
				.then(() => {
					observer.next()
					observer.next()
				})
				.catch(e => {
					console.log(e);
					observer.error(e)
				});
		})
		//
	}

}
