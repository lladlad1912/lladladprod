package com.blogapp.service;

import com.blogapp.model.Client;
import com.blogapp.repository.ClientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class ClientService {

    @Autowired
    private ClientRepository clientRepository;

    public List<Client> getAllClients() {
        return clientRepository.findAllByOrderByDisplayOrderAsc();
    }

    public List<Client> getActiveClients() {
        return clientRepository.findByIsActiveTrueOrderByDisplayOrderAsc();
    }

    public List<Client> getActiveClientsByCategory(String category) {
        return clientRepository.findByServiceCategoryAndIsActiveTrueOrderByDisplayOrderAsc(category);
    }

    public Client getClientById(Long id) {
        return clientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Client not found with id: " + id));
    }

    public Client createClient(Client client) {
        if (client.getDisplayOrder() == null) {
            int maxOrder = clientRepository.findAllByOrderByDisplayOrderAsc().stream()
                    .mapToInt(c -> c.getDisplayOrder() != null ? c.getDisplayOrder() : 0)
                    .max()
                    .orElse(0);
            client.setDisplayOrder(maxOrder + 1);
        }
        if (client.getIsActive() == null) {
            client.setIsActive(true);
        }
        return clientRepository.save(client);
    }

    public Client updateClient(Long id, Client details) {
        Client client = getClientById(id);

        if (details.getName() != null) {
            client.setName(details.getName());
        }
        if (details.getCompany() != null) {
            client.setCompany(details.getCompany());
        }
        if (details.getServiceCategory() != null) {
            client.setServiceCategory(details.getServiceCategory());
        }
        if (details.getDescription() != null) {
            client.setDescription(details.getDescription());
        }
        if (details.getWebsite() != null) {
            client.setWebsite(details.getWebsite());
        }
        if (details.getLogoUrl() != null) {
            client.setLogoUrl(details.getLogoUrl());
        }
        if (details.getUpdateTitle() != null) {
            client.setUpdateTitle(details.getUpdateTitle());
        }
        if (details.getUpdateContent() != null) {
            client.setUpdateContent(details.getUpdateContent());
        }
        if (details.getDisplayOrder() != null) {
            client.setDisplayOrder(details.getDisplayOrder());
        }
        if (details.getIsActive() != null) {
            client.setIsActive(details.getIsActive());
        }

        return clientRepository.save(client);
    }

    public void deleteClient(Long id) {
        clientRepository.deleteById(id);
    }
}
