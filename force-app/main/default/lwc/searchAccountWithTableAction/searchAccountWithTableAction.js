import { LightningElement,wire} from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import LightningAlert from 'lightning/alert';
import LightningConfirm from 'lightning/confirm';
import { NavigationMixin } from 'lightning/navigation';
import { deleteRecord } from 'lightning/uiRecordApi';
import { refreshApex } from '@salesforce/apex';
import getAccount from '@salesforce/apex/LwcComponentHandler.getAccount';
import getSearchAccount from '@salesforce/apex/LwcComponentHandler.getSearchAccount';
import deleteSelectedAccount from '@salesforce/apex/LwcComponentHandler.deleteSelectedAccount';

 const columns = [
    { label: 'Account Name', fieldName: 'Name', type :'text' },
    { label: 'Rating', fieldName: 'Rating', type: 'picklist'},
    { label: 'Industry', fieldName: 'Industry', type: 'picklist' },
    { label: 'Phone', fieldName: 'Phone', type: 'Phone' },
    { label: 'AnnualRevenue', fieldName: 'AnnualRevenue', type: 'currency',cellAttributes: { alignment: 'left' }},
    { type: "button-icon", fixedWidth: 40, typeAttributes:{
            label: 'View',
            name: 'View',
            title: 'View',
            disabled: false,
            value: 'view',
           // iconPosition: 'left',
            iconName:'utility:preview',
            //variant:'Brand'
      }
    },
     { type: "button-icon", fixedWidth: 40, typeAttributes: {
            label: 'Edit',
            name: 'Edit',
            title: 'Edit',
            disabled: false,
            value: 'edit',
          //  iconPosition: 'left',
            iconName:'utility:edit',
           // variant:'Brand'
        }
    },
    { type: "button-icon", fixedWidth: 55, typeAttributes: {
            label: 'Delete',
            name: 'Delete',
            title: 'Delete',
            disabled: false,
            value: 'delete',
           // iconPosition: 'left',
            iconName:'utility:delete',
           // variant:'destructive',
            iconClass:'slds-icon-text-error'
        }
    }
    
 ];


export default class SearchAccountWithTableAction extends NavigationMixin(LightningElement) {
    columnsList=columns;
    isModalOpen=false;
    isSearchTable1;
    isButtonTable2=false;
    clickedButtonLabel='GetAccounts';
    accountName;
    wireResult;
    data;
    isVisible=false;
    recordsCount = 0;
    recordId;
    accountIds;
    // Show toast event
     showToast(title, message, variant, mode) {
        const evt = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant,
            mode: mode
        });
        this.dispatchEvent(evt);
    };
    // lightning Alert
    async showAlert(label,message,theme) {
        await LightningAlert.open({
            message:message ,
            theme: theme, // error,success,warning,inverse
            label: label, // this is the header text
        });
        //Alert has been closed
    }
   
    // edit And view Record using Nevigation Service
      handleAction(recordId,objectName, mode) {
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: recordId,
                objectApiName: objectName,
                actionName: mode                  // mode => view,edit
            }
        })
      }

   // Create New Record using Nevigation Service
     handleActionNew(objectName, mode) {
        this[NavigationMixin.Navigate]({
            type: 'standard__objectPage',
            attributes: {
                //recordId: recordId,
                objectApiName: objectName,
                actionName: mode                   // mode => new,home
            }
        })
     }

    // deleted record without apex calling
   async handleDeleteRow(recordIdToDelete) {
          // lightning confirm
        const result = await LightningConfirm.open({
            message:'Are you sure you want to delete this?' ,
            variant: 'default',
            label: 'Delete a record',
             theme : 'alt-inverse'   // setting theme would have no effect
        });
        if(result){
          deleteRecord(recordIdToDelete)
            .then(results => {
                this.showToast('Success!!', 'Record deleted successfully!!', 'success', 'dismissable');
                return refreshApex(this.wireResult);
            })
            .catch(error => {
               this.error=error;
              // this.showToast('Error!!', 'Something went wrong', 'error', 'dismissable');
               this.showAlert("Error deleting record", error.body.output.errors[0].errorCode +"-" +error.body.output.errors[0].message,'error');
            });
        }
       
    }

    // nevigation servies create new case
     navigateToNewCasePage(event) {
         this.handleActionNew( 'Case','new'); 
    }
    // nevigation servies create new account
     navigateToNewAccountPage(event) {
         this.handleActionNew('Account','new'); 
    }
      // search input field rendering show hide data table
     searchNameHandler(event){
     console.log('input field :'+event.target);
     console.log('input field :'+event.detail);
     this.accountName=event.target.value;
     if(this.accountName==''){
        this.isSearchTable1=false;
        this.isVisible=false;
     }else{
        this.isSearchTable1=true;
     }
    };
    closeModal(event){
        this.isModalOpen=false;
    }
    // get Account using wire method
    @wire(getSearchAccount,{searchKey:"$accountName"}) 
     accountRecords(result){
      this.wireResult = result;
        if (result.data) {
            this.data = result.data;
        } else if (result.error) {
            this.error = result.error;
        }
    }
  // Get Account Button click
   getAccountHandle(event){
     console.log('button ::'+event.target);
     console.log('button ::'+event.detail);
     const label = event.target.label; 
     if ( label === 'GetAccounts') {
      this.clickedButtonLabel = 'HideAccounts';  
       this.isSearchTable1=false;
       this.isButtonTable2=true;
       this.isVisible=false;
       this.accountName='';
      // imperative Method
     getAccount()
       .then(resul=>{
        this.data=resul;
        this.showToast('Success!!',' Record Are Geting !!', 'success', 'dismissable');
        console.log(JSON.stringify(resul));
       })
      .catch(error=>{
         this.showToast('Error!!', error, 'error', 'dismissable');
      }); 
    }else if( label === 'HideAccounts'){
       this.clickedButtonLabel = 'GetAccounts'; 
       this.isSearchTable1=false;
       this.isButtonTable2=false;
       this.isVisible=false;
       this.accountName='';
     }    

  }
   
       // Data Table Action Button event
     callRowAction(event) {
        this.recordId = event.detail.row.Id;
        console.log('recId :' + this.recordId);
        const actionName = event.detail.action.name;
        console.log('actionName :' +actionName);
        if (actionName === 'Edit') {
            this.handleAction( this.recordId,'Account','edit');   // call edit function with parameter pass to handleAction
        } else if (actionName === 'Delete') {
            this.handleDeleteRow(this.recordId);         // call delete function with parameter pass
        } else if (actionName === 'View') {
           this.isModalOpen=true;
               
        }
    }
    
    // onrow selection operation
    handleRowSelection(event){
       this.isVisible=true;
       this.recordsCount = event.detail.selectedRows.length;
       const selectRows=event.detail.selectedRows;
       console.log('selectRows :=>'+JSON.stringify(selectRows));
        var recordIdSet = new Set();   
       for(let i = 0 ; i < selectRows.length ; i++){
           recordIdSet.add(selectRows[i].Id);
       }
          this.accountIds=Array.from(recordIdSet);
           console.log('accountIds :' +this.accountIds);
      };
    
 // deleted record using 'lightning/uiRecordApi'
     async deleteButtonClick(){ 
         // lightning confirm
        const result = await LightningConfirm.open({
            message:'Are you sure you want to delete this Record ?' ,
            variant: 'default',
            label: 'Delete a record',
            theme :'inverse'     // setting theme would have no effect
                
        });
       console.log(result); 
       if(result){
        deleteSelectedAccount({accIdList : this.accountIds})
         .then((sucess)=>{
         // alert('Im in delete');
           this.showToast('Success!!', this.recordsCount+' Record are deleted successfully!!', 'success', 'dismissable');
           return refreshApex(this.wireResult);
        })
        .catch((error)=>{
             this.showToast('Error!!', 'This record can not be deleted', 'error', 'dismissable');
             this.showAlert("Error deleting record", JSON.stringify(error),'error');
         }) 
           
     }
  }
}