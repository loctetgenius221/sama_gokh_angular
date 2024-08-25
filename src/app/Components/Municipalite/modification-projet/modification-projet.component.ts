import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { ProjetsService } from '../../../Services/projets.service';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-modification-projet',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,RouterLink],
  templateUrl: './modification-projet.component.html',
  styleUrls: ['./modification-projet.component.css']
})
export class ModificationProjetComponent implements OnInit {
  projetForm: FormGroup;
  projetId!: number;
  imageFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    private projetsService: ProjetsService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.projetForm = this.fb.group({
      nom: ['', Validators.required],
      budget: ['', Validators.required],
      date_debut: ['', Validators.required],
      date_fin: ['', Validators.required],
      statut: ['', Validators.required],
      description: [''],
      photo: [null]
    });
  }

  ngOnInit(): void {
    this.projetId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.projetId) {
      this.loadProjet();
    }
  }

loadProjet(): void {
  this.projetsService.getProjetById(this.projetId).subscribe(
    projet => {
      // Assurez-vous que les dates sont en format 'YYYY-MM-DD' pour les inputs de type date
      const date_debut = projet.date_debut ? new Date(projet.date_debut).toISOString().substring(0, 10) : '';
      const date_fin = projet.date_fin ? new Date(projet.date_fin).toISOString().substring(0, 10) : '';
      
      this.projetForm.patchValue({
        nom: projet.nom,
        budget: projet.budget,
        date_debut: date_debut,
        date_fin: date_fin,
        statut: projet.statut,
        description: projet.description
      });
    },
    (error: HttpErrorResponse) => {
      console.error('Erreur lors de la récupération du projet:', error.message);
    }
  );
}


  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.imageFile = file;
    }
  }

  onSubmit(): void {
    if (this.projetForm.valid) {
      const formData = new FormData();
      Object.keys(this.projetForm.value).forEach(key => {
        formData.append(key, this.projetForm.value[key]);
      });
      if (this.imageFile) {
        formData.append('photo', this.imageFile, this.imageFile.name);
      }
  
      const projet = {
        ...this.projetForm.value, // Les valeurs du formulaire
        id: this.projetId // Ajout de l'identifiant du projet
      };
  
      this.projetsService.updateProjet(projet).subscribe(
        () => {
          // Afficher SweetAlert de succès
          Swal.fire({
            icon: 'success',
            title: 'Projet modifié',
            text: 'Le projet a été modifié avec succès!',
            showConfirmButton: false,
            timer: 2000 // L'alerte disparaît après 2 secondes
          });
  
          // Naviguer vers une autre page après un petit délai pour que l'utilisateur puisse voir l'alerte
          setTimeout(() => {
            this.router.navigate(['/sidebar1/projet']);
          }, 2000);
        },
        (error: HttpErrorResponse) => {
          console.error('Erreur lors de la modification du projet:', error.message);
  
          // Afficher SweetAlert d'erreur
          Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: 'Une erreur s\'est produite lors de la modification du projet.',
            showConfirmButton: false,
            timer: 3000 // L'alerte disparaît après 3 secondes
          });
        }
      );
    }
  }
  
  
}
