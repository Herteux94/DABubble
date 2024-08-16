// import { Injectable, ComponentFactoryResolver, ApplicationRef, Injector, EmbeddedViewRef, ComponentRef } from '@angular/core';

// @Injectable({
//   providedIn: 'root'
// })
// export class DialogsService {

//   private dialogComponentRef: ComponentRef<any> | null = null;

//   constructor(
//     private componentFactoryResolver: ComponentFactoryResolver,
//     private appRef: ApplicationRef,
//     private injector: Injector
//   ) { }

//   openDialog(component: any): void {
//     // Wenn ein Dialog bereits geöffnet ist, schließe ihn zuerst
//     if (this.dialogComponentRef) {
//       this.closeDialog();
//     }

//     // Erstelle die Komponente
//     const componentRef = this.componentFactoryResolver
//       .resolveComponentFactory(component)
//       .create(this.injector);

//     this.appRef.attachView(componentRef.hostView);

//     const domElem = (componentRef.hostView as EmbeddedViewRef<any>).rootNodes[0] as HTMLElement;
//     document.body.appendChild(domElem);

//     this.dialogComponentRef = componentRef;
//   }

//   closeDialog(): void {
//     if (this.dialogComponentRef) {
//       this.appRef.detachView(this.dialogComponentRef.hostView);
//       this.dialogComponentRef.destroy();
//       this.dialogComponentRef = null;
//     }
//   }
// }
