import { Component, HostListener, NgZone } from '@angular/core';

import {Web3Service, MetaCoinService} from '../services/services'

import { canBeNumber } from '../util/validation';

declare var window: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {

  // TODO add proper types these variables
  account: any;
  accounts: any;

  balance: number;
  sendingAmount: number;
  recipientAddress: string;
  status: string;
  canBeNumber = canBeNumber;

  constructor(
    private _ngZone: NgZone,
    private web3Service: Web3Service,
    private metaCoinService: MetaCoinService,
    ) {
    this.onReady();
  }

  onReady = () => {

    // Get the initial account balance so it can be displayed.
    this.web3Service.getAccounts().subscribe(accs => {
      this.accounts = accs;
      console.log('list',this.accounts);
      this.account = this.accounts[0];
      console.log('one',this.account);
      // This is run from window:load and ZoneJS is not aware of it we
      // need to use _ngZone.run() so that the UI updates on promise resolution
      this._ngZone.run(() =>
        this.getWhiteListCount()
      );
    }, err => alert(err))
  };

  getWhiteListCount = () => {
    debugger;
    this.metaCoinService.getWhiteListCount()
      .subscribe(value => {
        debugger;
        this.balance = value
      }, e => {this.setStatus('Error getting balance; see log.')})
  };

  setStatus = message => {
    this.status = message;
  };

  sendCoin = () => {
    this.setStatus('Initiating transaction... (please wait)');

    // this.metaCoinService.sendCoin()
    //   .subscribe(() =>{
    //     this.setStatus('Transaction complete!');
    //     this.getWhiteListCount();
    //   }, e => this.setStatus('Error sending coin; see log.'))

    this.metaCoinService.transferOwnerShip()
      .subscribe(() =>{
        this.setStatus('Transaction complete!');
        this.getWhiteListCount();
      }, e => this.setStatus('Error sending coin; see log.'))
  };
}
