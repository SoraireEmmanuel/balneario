import { Component, OnInit, Input } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import Swal from 'sweetalert2';
import { map, filter } from 'rxjs/operators';

import { DetallesModel } from '../../models/detalles.model';
import { ItemModel } from '../../models/Item.model';


@Component({
  selector: 'app-reserva-croquis',
  templateUrl: './reserva-croquis.component.html',
  styleUrls: ['./reserva-croquis.component.css'],
})
export class ReservaCroquisComponent implements OnInit {
  ctrFlechasSombrillas: boolean;
  ctrFlechasCarpas: boolean;
  precioCarpa: number;
  precioSombrilla: number;
  precioEstacionamiento: number;
  carpa: number = 0;
  carpas: number[] = [];
  sombrilla: number = 0;
  sombrillas: number[] = [];
  total: number = 0;
  fechaInicio: string = '2020-12-01';
  fechaFin: string = '2021-02-28';
  items: ItemModel[] = [];
  reservable: DetallesModel[] = [];
  estacionamiento: boolean = true;
  posicionestacionamiento: number = 1;
  checkEstado: boolean = false;

@Input() fechaIn:string;
@Input() fechaOut:string;

  constructor(private auth: AuthService, private router: Router, private route: ActivatedRoute) {


  }
  ngOnInit(): void {
    this.fechaInicio=this.fechaIn
    //this.route.snapshot.paramMap.get('inicio')
    this.fechaFin=this.fechaOut
    //this.route.snapshot.paramMap.get('fin')


    this.ctrFlechasCarpas = true;
    this.ctrFlechasSombrillas = true;
    this.cargarReservable();
    this.botonReservar();
    this.cargarPrecio();
  }
  cargarPrecio() {
    this.auth.verPrecios().subscribe((res: any[]) => {
      this.precioCarpa = res[0].valor;
      this.precioSombrilla = res[1].valor;
      this.precioEstacionamiento = res[2].valor;
      console.log(this.precioSombrilla);
    });
  }
  cargarReservable() {
    this.auth
      .disponibilidadReeservable(this.fechaInicio, this.fechaFin)
      .subscribe((res: ItemModel[]) => {
        console.log(res);
        this.reservableReservado(res);
      });
  }
  cargarReserva() {
    var detalle: DetallesModel;
    for (let value of this.carpas) {
      detalle = {
        fecha_inicio: this.fechaInicio,
        fecha_fin: this.fechaFin,
        item: {
          numero: value,
          tipo: 'carpa',
        },
      };
      this.reservable.push(detalle);
    }
    for (let value of this.sombrillas) {
      detalle = {
        fecha_inicio: this.fechaInicio,
        fecha_fin: this.fechaFin,
        item: {
          numero: value,
          tipo: 'sombrilla',
        },
      };
      this.reservable.push(detalle);
    }
    console.log(this.estacionamiento);
    console.log(this.checkEstado);
    console.log(this.posicionestacionamiento);

    if (this.estacionamiento && this.checkEstado) {
      detalle = {
        fecha_inicio: this.fechaInicio,
        fecha_fin: this.fechaFin
        ,
        item: {
          numero: this.posicionestacionamiento,
          tipo: 'estacionamiento',
        },
      };
      this.reservable.push(detalle);
    }
  }
  comprar() {
    console.log(this.checkEstado);
    if (this.auth.estaAutenticado()) {
      Swal.fire({
        title: '¿Seguro que quiere confirmar la reserva?',
        text: `Esta por reservar ${this.carpa} carpas y ${this.sombrilla} sombrillas, por un monto total de $ ${this.total}`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, estoy seguro.',
        cancelButtonText: 'No, quiero corregir.',
      }).then((result) => {
        if (result.value) {
          Swal.fire({
            icon: 'info',
            allowOutsideClick: false,
            text: 'Espere por favor...',
          });
          Swal.showLoading();
          this.cargarReserva();
          console.log(this.reservable);
          this.auth.reservar(this.reservable).subscribe(
            (res) => {
              console.log(res);

              this.router.navigate(['listareservas']);
              Swal.fire({
                title: 'Muy bien!! Su reseva se realizo exitosamente',
                text:
                  'Enviamos un e-mail con la informacion de pago, tambien puede acceder al menu Mis Reservas para visualizaarla y abonarla!',
                icon: 'info',
              });
            },
            (error) => {
              Swal.fire({
                title: 'Sesion Expirada',
                text: 'Su Sesion ha expirado, ingrese nuevamente por favor!',
                icon: 'error',
              });
            }
          );
        } else if (result.dismiss === Swal.DismissReason.cancel) {
        }
      });
    } else {
      Swal.fire({
        title: 'No puede seguir',
        text: 'Necesita estar registrado para realizar la reserva',
        icon: 'info',
      });
    }
  }

  botonSombrillas() {
    this.ctrFlechasSombrillas = !this.ctrFlechasSombrillas;
  }

  botonCarpas() {
    this.ctrFlechasCarpas = !this.ctrFlechasCarpas;
  }

  seleccionarCarpa(id: string) {}

  reservableReservado(reservable: ItemModel[]) {
    for (let posicion of reservable) {
      if (posicion.tipo == 'carpa') {
        (<HTMLInputElement>(
          document.getElementById(`c${posicion.numero}`)
        )).disabled = true;
        document.getElementById(`c${posicion.numero}`).style.background =
          'grey';
        document.getElementById(`c${posicion.numero}`).style.color = 'black';
        document.getElementById(`c${posicion.numero}`).style.opacity = '0.5';
      }
      if (posicion.tipo == 'sombrilla') {
        (<HTMLInputElement>(
          document.getElementById(`s${posicion.numero}`)
        )).disabled = true;
        document.getElementById(`s${posicion.numero}`).style.background =
          'grey';
        document.getElementById(`s${posicion.numero}`).style.color = 'black';
        document.getElementById(`s${posicion.numero}`).style.opacity = '0.5';
      }
      let cant = 1;
      if (posicion.tipo == 'estacionamiento') {
        if (posicion.numero == this.posicionestacionamiento) {
          this.posicionestacionamiento = this.posicionestacionamiento + 1;
        }
        cant = cant + 1;
      }
    }
    if (this.posicionestacionamiento > 19) {
      this.estacionamiento = false;
    }
  }
  reservableSeleccionar(id: string, tipo: string, numero: number) {
    if (tipo == 'carpa') {
      if (this.carpaSeleccionada(numero)) {
        document.getElementById(id).style.background = 'green';
        this.carpas.push(numero);
        this.carpa = this.carpas.length;
        this.calcularTotal();
        console.log(this.carpas);
      } else {
        document.getElementById(id).style.background = 'red';
        this.carpas = this.eliminarNumero(numero, this.carpas);
        console.log(this.carpas);
        this.calcularTotal();
        this.carpa = this.carpas.length;
      }
    }
    if (tipo == 'sombrilla') {
      if (this.sombrillaSeleccionada(numero)) {
        document.getElementById(id).style.background = 'green';
        this.sombrillas.push(numero);
        this.sombrilla = this.sombrillas.length;
        this.calcularTotal();
      } else {
        document.getElementById(id).style.background = 'red';
        this.sombrillas = this.eliminarNumero(numero, this.sombrillas);
        console.log(this.sombrillas);
        this.calcularTotal();
        this.sombrilla = this.sombrillas.length;
      }
    }
  }
  eliminarNumero(numero: number, arreglo: number[]): number[] {
    var localArray: number[] = [];
    for (let value of arreglo) {
      if (value != numero) {
        localArray.push(value);
      }
    }
    return localArray;
  }
  carpaSeleccionada(numero: number): boolean {
    for (let value of this.carpas) {
      if (value == numero) {
        return false;
      }
    }
    return true;
  }
  sombrillaSeleccionada(numero: number): boolean {
    for (let value of this.sombrillas) {
      if (value == numero) {
        return false;
      }
    }
    return true;
  }
  calcularTotal() {
    console.log(this.precioSombrilla);
    this.total =
      this.precioCarpa * this.carpas.length +
      this.precioSombrilla * this.sombrillas.length;
    this.botonReservar();
  }

  botonReservar() {
    if (this.carpas.length > 0 || this.sombrillas.length > 0) {
      (<HTMLInputElement>(
        document.getElementById(`botonReservar`)
      )).disabled = false;
    } else {
      (<HTMLInputElement>(
        document.getElementById(`botonReservar`)
      )).disabled = true;
    }
  }
  haycochera(): boolean {
    return this.estacionamiento;
  }
  checkCochera() {
    this.checkEstado = !this.checkEstado;
    console.log(this.checkEstado);
  }
}
