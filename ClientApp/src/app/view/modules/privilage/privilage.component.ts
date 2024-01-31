import {Component, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {Role} from "../../../entity/role";
import {Module} from "../../../entity/module";
import {Operation} from "../../../entity/operation";
import {Roleservice} from "../../../service/roleservice";
import {Moduleservice} from "../../../service/moduleservice";
import {Operationservice} from "../../../service/operationservice";
import {MatTableDataSource} from "@angular/material/table";
import {Privilege} from "../../../entity/privilege";
import {UiAssist} from "../../../util/ui/ui.assist";
import {Privilageservice} from "../../../service/privilageservice";
import {MatPaginator} from "@angular/material/paginator";
import {ConfirmComponent} from "../../../util/dialog/confirm/confirm.component";
import {MatDialog} from "@angular/material/dialog";
import {MessageComponent} from "../../../util/dialog/message/message.component";
import {Employee} from "../../../entity/employee";
import {AuthorizationManager} from "../../../service/authorizationmanager";
import {Opetype} from "../../../entity/opetype";
import {Opetypeservice} from "../../../service/opetypeservice";

@Component({
  selector: 'app-privileg',
  templateUrl: './privilage.component.html',
  styleUrls: ['./privilage.component.css']
})
export class PrivilageComponent {

  form!:FormGroup;
  ssearch!:FormGroup;

  roles!:Array<Role>;
  modules!:Array<Module>;
  operations!:Array<Operation>;
  opetypes!:Array<Opetype>;
  privilages!:Array<Privilege>;

  privilage!:Privilege;
  oldprivilage!:Privilege;

  columns: string[] = ['role', 'authority','module', 'operation'];
  headers: string[] = ['Role','Authority', 'Model', 'Operation'];
  binders: string[] = ['role.name','authority', 'module.name', 'operation.name'];

  data!:MatTableDataSource<Privilege>
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  uiassist: UiAssist;

  imageurl: string = '';

  enaadd:boolean = false;
  enaupd:boolean = false;
  enadel:boolean = false;

  selectedrow: any;

  constructor(
    private fb:FormBuilder,
    private rs:Roleservice,
    private ms:Moduleservice,
    private os:Operationservice,
    private ot:Opetypeservice,
    private ps:Privilageservice,
    private dg:MatDialog,
    public authService:AuthorizationManager
  ) {

    this.uiassist = new UiAssist(this);
    this.privilages = new Array<Privilege>();

    this.form = this.fb.group({
      "role":new FormControl('',Validators.required),
      "module":new FormControl('',Validators.required),
      "operation":new FormControl('',Validators.required),
      "authority":new FormControl(),
    }, {updateOn: 'change'});

    this.ssearch = this.fb.group({
      "ssrole":new FormControl(),
      "ssmodule":new FormControl(),
      "ssoperation":new FormControl(),
    });

  }



  ngOnInit() {
    this.initialize();
  }


  initialize() {

    this.createView();

    this.rs.getAllList().then((rls:Role[])=>{
      this.roles = rls;
    });

    this.os.getAllList().then((ops:Operation[])=>{
      this.operations = ops;
    });

    this.ot.getAllList().then((optps:Opetype[])=>{
      this.opetypes = optps;
    });

    this.ms.getAllList().then((mds:Module[])=>{
      this.modules = mds;
    });

    this.createForm();

  }



  createForm() {

    this.form.controls['role'].setValidators([Validators.required]);
    this.form.controls['module'].setValidators([Validators.required]);
    this.form.controls['operation'].setValidators([Validators.required]);
    this.form.controls['authority'].setValidators([Validators.required]);

    Object.values(this.form.controls).forEach( control => { control.markAsTouched(); } );

    for (const controlName in this.form.controls) {
      const control = this.form.controls[controlName];
      control.valueChanges.subscribe(value => {

          if (this.oldprivilage != undefined && control.valid) {
            // @ts-ignore
            if (value === this.privilage[controlName]) {
              control.markAsPristine();
            } else {
              control.markAsDirty();
            }
          } else {
            control.markAsPristine();
          }
        }
      );

    }

    this.enableButtons(true,false,false);
    this.loadForm();

  }


  enableButtons(add:boolean, upd:boolean, del:boolean){
    this.enaadd=add;
    this.enaupd=upd;
    this.enadel=del;
  }


  loadForm() {
    console.log("Initila-"+JSON.stringify(this.privilage));
  }


  createView() {
    this.imageurl = 'assets/pending.gif';
    this.loadTable("");
  }


  loadTable(query:string):void{

    this.ps.getAll(query)
      .then((prvgs: Privilege[]) => {
        this.privilages = prvgs;
        this.imageurl = 'assets/fullfilled.png';
      })
      .catch((error) => {
        console.log(error);
        this.imageurl = 'assets/rejected.png';
      })
      .finally(() => {
        this.data = new MatTableDataSource(this.privilages);
        this.data.paginator = this.paginator;
      });

  }


  btnSearchMc(): void {

    const sserchdata = this.ssearch.getRawValue();

    let roleid = sserchdata.ssrole;
    let moduleid = sserchdata.ssmodule;
    let operationid = sserchdata.ssoperation;

    let query = "";

    if (roleid != null) query = query + "&roleid=" + roleid;
    if (moduleid != null) query = query + "&moduleid=" + moduleid;
    if (operationid != null) query = query + "&operationid=" + operationid;

    if (query != "") query = query.replace(/^./, "?")

    this.loadTable(query);

  }



  btnSearchClearMc(): void {

    const confirm = this.dg.open(ConfirmComponent, {
      width: '500px',
      data: {heading: "Search Clear", message: "Are you sure to Clear the Search?"}
    });

    confirm.afterClosed().subscribe(async result => {
      if (result) {
        this.ssearch.reset();
        this.loadTable("");
      }
    });

  }

  generateAuthority(): void {
    const module = this.form.controls['module'].getRawValue().name.toLowerCase();
    const operation = this.form.controls['operation'].getRawValue().name.toLowerCase();

    if (module != null && operation != null) {
      this.form.controls['authority'].setValue(module + "-" + operation);
    }
  }


  add() {

    let errors = this.getErrors();

    if (errors != "") {
      const errmsg = this.dg.open(MessageComponent, {
        width: '500px',
        data: {heading: "Errors - Privilege Add ", message: "You have following Errors <br> " + errors}
      });
      errmsg.afterClosed().subscribe(async result => {
        if (!result) {
          return;
        }
      });
    } else {

      this.privilage = this.form.getRawValue();

      let prvdata: string = "";

      prvdata = prvdata + "<br>Role is : " + this.privilage.role.name
      prvdata = prvdata + "<br>Module is : " + this.privilage.module.name;
      prvdata = prvdata + "<br>Operation is : " + this.privilage.operation.name;
      prvdata = prvdata + "<br>Authority is : " + this.privilage.authority;

      const confirm = this.dg.open(ConfirmComponent, {
        width: '500px',
        data: {
          heading: "Confirmation - Privilege Add",
          message: "Are you sure to Add the folowing Employee? <br> <br>" + prvdata
        }
      });

      let addstatus: boolean = false;
      let addmessage: string = "Server Not Found";

      confirm.afterClosed().subscribe(async result => {
        if (result) {
          // console.log("EmployeeService.add(emp)");

          this.ps.add(this.privilage).then((responce: [] | undefined) => {
            //console.log("Res-" + responce);
            //console.log("Un-" + responce == undefined);
            if (responce != undefined) { // @ts-ignore
              console.log("Add-" + responce['id'] + "-" + responce['url'] + "-" + (responce['errors'] == ""));
              // @ts-ignore
              addstatus = responce['errors'] == "";
              console.log("Add Sta-" + addstatus);
              if (!addstatus) { // @ts-ignore
                addmessage = responce['errors'];
              }
            } else {
              console.log("undefined");
              addstatus = false;
              addmessage = "Content Not Found"
            }
          }).finally(() => {

            if (addstatus) {
              addmessage = "Successfully Saved";
              this.form.reset();
              Object.values(this.form.controls).forEach(control => {
                control.markAsTouched();
              });
              this.loadTable("");
            }

            const stsmsg = this.dg.open(MessageComponent, {
              width: '500px',
              data: {heading: "Status -Privilege Add", message: addmessage}
            });

            stsmsg.afterClosed().subscribe(async result => {
              if (!result) {
                return;
              }
            });
          });
        }
      });
    }
  }



  getErrors(): string {

    let errors: string = "";
    for (const controlName in this.form.controls) {
      const control = this.form.controls[controlName];
      if (control.errors)
        errors = errors + "<br>Invalid " + controlName;
    }
    return errors;

  }


  fillForm(privilege: Privilege) {

    this.enableButtons(false,true,true);

    this.selectedrow= privilege;

    this.privilage = JSON.parse(JSON.stringify(privilege));
    this.oldprivilage = JSON.parse(JSON.stringify(privilege));


    //@ts-ignore
    this.privilage.role = this.roles.find(r => r.id === this.privilage.role.id);

    //@ts-ignore
    this.privilage.module = this.modules.find(m => m.id === this.privilage.module.id);

    //@ts-ignore
    this.privilage.operation = this.operations.find(o => o.id === this.privilage.operation.id);

    console.log(JSON.stringify(this.privilage));

    this.form.patchValue(this.privilage);
    this.form.markAsPristine();

    console.log(JSON.stringify(this.form.getRawValue()));

  }



  getUpdates(): string {
    let updates: string = "";
    for (const controlName in this.form.controls) {
      const control = this.form.controls[controlName];
      if (control.dirty) {
        updates = updates + "<br>" + controlName.charAt(0).toUpperCase() + controlName.slice(1)+" Changed";
      }
    }
    return updates;
  }

  update() {

    let errors = this.getErrors();

    if (errors != "") {

      const errmsg = this.dg.open(MessageComponent, {
        width: '500px',
        data: {heading: "Errors - Privilege Update ", message: "You have following Errors <br> " + errors}
      });
      errmsg.afterClosed().subscribe(async result => { if (!result) { return; } });

    } else {

      let updates: string = this.getUpdates();

      if (updates != "") {

        let updstatus: boolean = false;
        let updmessage: string = "Server Not Found";

        const confirm = this.dg.open(ConfirmComponent, {
          width: '500px',
          data: {
            heading: "Confirmation - Privilege Update",
            message: "Are you sure to Save folowing Updates? <br> <br>" + updates
          }
        });
        confirm.afterClosed().subscribe(async result => {
          if (result) {
            //console.log("EmployeeService.update()");
            this.privilage = this.form.getRawValue();

            this.privilage.id = this.oldprivilage.id;

            this.ps.update(this.privilage).then((responce: [] | undefined) => {
              //console.log("Res-" + responce);
              // console.log("Un-" + responce == undefined);
              if (responce != undefined) { // @ts-ignore
                //console.log("Add-" + responce['id'] + "-" + responce['url'] + "-" + (responce['errors'] == ""));
                // @ts-ignore
                updstatus = responce['errors'] == "";
                //console.log("Upd Sta-" + updstatus);
                if (!updstatus) { // @ts-ignore
                  updmessage = responce['errors'];
                }
              } else {
                //console.log("undefined");
                updstatus = false;
                updmessage = "Content Not Found"
              }
            }).finally(() => {
              if (updstatus) {
                updmessage = "Successfully Updated";
                this.form.reset();
                Object.values(this.form.controls).forEach(control => { control.markAsTouched(); });
                this.loadTable("");
              }

              const stsmsg = this.dg.open(MessageComponent, {
                width: '500px',
                data: {heading: "Status -Privilege Update", message: updmessage}
              });
              stsmsg.afterClosed().subscribe(async result => { if (!result) { return; } });

            });
          }
        });
      }
      else {

        const updmsg = this.dg.open(MessageComponent, {
          width: '500px',
          data: {heading: "Confirmation - Privilege Update", message: "Nothing Changed"}
        });
        updmsg.afterClosed().subscribe(async result => { if (!result) { return; } });

      }
    }

  }


  delete() {

    const confirm = this.dg.open(ConfirmComponent, {
      width: '500px',
      data: {
        heading: "Confirmation - Privilege Delete",
        message: "Are you sure to Delete folowing Authority? <br> <br>" + this.privilage.authority
      }
    });

    confirm.afterClosed().subscribe(async result => {
      if (result) {
        let delstatus: boolean = false;
        let delmessage: string = "Server Not Found";

        this.ps.delete(this.privilage.id).then((responce: [] | undefined) => {

          if (responce != undefined) { // @ts-ignore
            delstatus = responce['errors'] == "";
            if (!delstatus) { // @ts-ignore
              delmessage = responce['errors'];
            }
          } else {
            delstatus = false;
            delmessage = "Content Not Found"
          }
        } ).finally(() => {
          if (delstatus) {
            delmessage = "Successfully Deleted";
            this.form.reset();
            Object.values(this.form.controls).forEach(control => { control.markAsTouched(); });
            this.loadTable("");
          }

          const stsmsg = this.dg.open(MessageComponent, {
            width: '500px',
            data: {heading: "Status - Privilege Delete ", message: delmessage}
          });
          stsmsg.afterClosed().subscribe(async result => { if (!result) { return; } });

        });
      }
    });
  }

}
