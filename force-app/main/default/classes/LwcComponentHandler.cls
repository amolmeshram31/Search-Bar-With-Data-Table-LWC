public with sharing class LwcComponentHandler {
    @AuraEnabled
     public static List<Account> getAccount(){
         List<Account> accList= [Select Id,Name,Rating,Phone, Industry, AnnualRevenue From Account];
         System.debug('accList -accList' +accList);
          return accList;   
         
    }
     @AuraEnabled(cacheable=true)
     public static List<Account> getSearchAccount(String searchKey){
       
         String key='%'+searchKey+'%';
         List<Account> accList= [Select Id,Name,Rating,Phone, Industry, AnnualRevenue From Account Where Name LIKE :key];
         return accList;
    }
    @AuraEnabled
     public static void deleteSelectedAccount(List<String> accIdList){
     System.debug('Ids :'+accIdList);
    List<Account> accObjList = [Select Id, Name From Account Where Id IN:accIdList];
    List<Account> accObjItem = new List<Account>();
     for(Account acc:accObjList){
       accObjItem.add(acc);
     }
     system.debug('accObjItem :'+accObjItem);
     if(accObjItem.size()>0){
     try{
       delete accObjItem;
     }
     catch (Exception exp) {
         throw new AuraHandledException(exp.getMessage());
     }
    }
   }
   
      @AuraEnabled(cacheable=true)
     public static List<AccountWrapper> getAccountWithContact(){
         List<AccountWrapper> wrapList = new List<AccountWrapper>();
         List<Account> accList = [ SELECT Id,Name, (SELECT Id,FirstName, LastName FROM Contacts)  FROM Account LIMIT 5];                                 
         if(!accList.isEmpty()){
             for(Account acc : accList){
                 wrapList.add(new AccountWrapper(acc, acc.Contacts));
             }
         }
         return wrapList;
     } 
     // wraper class 
     public class AccountWrapper{
         @AuraEnabled public Account accRecord{get;set;}
         @AuraEnabled public List<Contact> contactList{get;set;}
         public AccountWrapper(Account accRecord, List<Contact> contactList){
             this.accRecord = accRecord;
             this.contactList = contactList;
         }
     }
 
 }