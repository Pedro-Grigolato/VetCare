package br.com.vetcare.service;

import br.com.vetcare.entity.Pet;
import br.com.vetcare.exception.ResourceNotFoundException;
import br.com.vetcare.repository.PetRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PetService {
    private final PetRepository petRepository;

    public PetService(PetRepository petRepository) {
        this.petRepository = petRepository;
    }

    public List<Pet> listarTodos(){
        return petRepository.findAll();
    }

    public Pet buscarPorId(long id) {
        return petRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Pet não encontrado com o ID: " + id));
    }

    public Pet salvar(Pet pet) {
        return petRepository.save(pet);
    }

    public void deletar(Long id) {
        Pet pet = buscarPorId(id);
        petRepository.delete(pet);
    }

    public Pet atualizar(Long id, Pet petAtualizado) {

        Pet petExistente = buscarPorId(id);

        petExistente.setNome(petAtualizado.getNome());
        petExistente.setEspecie(petAtualizado.getEspecie());
        petExistente.setRaca(petAtualizado.getRaca());
        petExistente.setPorte(petAtualizado.getPorte());
        petExistente.setStatus(petAtualizado.getStatus());

        return petRepository.save(petExistente);
    }
}