package br.com.vetcare.controller;

import br.com.vetcare.entity.Pet;
import br.com.vetcare.service.PetService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController // Avisa o Spring Boot que essa classe é um controlador web e que todas as respostas serão trasnformadas automaticamente em JSON (formato ideal para consumir o front)
@RequestMapping("/api/pets") // Define que todas as rotas aqui começam com /api/pets
public class PetController {

    private final PetService petService;

    public PetController(PetService petService) {
        this.petService = petService;
    }

    @GetMapping
    public List<Pet> listarTodos() {
      return petService.listarTodos();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Pet> buscarPorId(@PathVariable Long id) {
        Pet pet = petService.buscarPorId(id);
        return ResponseEntity.ok(pet);
    }

    @PostMapping
    public ResponseEntity<Pet> salvar(@RequestBody Pet pet) {
        Pet novoPet = petService.salvar(pet);
        return ResponseEntity.status(HttpStatus.CREATED).body(novoPet);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        petService.deletar(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Pet> atualizar(@PathVariable Long id, @RequestBody Pet pet) {
        Pet petAtualizado = petService.atualizar(id, pet);
        return ResponseEntity.ok(petAtualizado);
    }
}