package com.centuryply.portal.config;

import com.centuryply.portal.entity.Document;
import com.centuryply.portal.entity.Role;
import com.centuryply.portal.entity.User;
import com.centuryply.portal.repository.DocumentRepository;
import com.centuryply.portal.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;

@Configuration
public class DataInitializer {
    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    @Bean
    public CommandLineRunner initData(
        UserRepository userRepository,
        DocumentRepository documentRepository,
        PasswordEncoder passwordEncoder,
        @Value("${portal.upload-dir:uploads}") String uploadDir,
        @Value("${portal.seed-demo-data:false}") boolean seedDemoData
    ) {
        return args -> {
            Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
            Files.createDirectories(uploadPath);

            if (seedDemoData && userRepository.count() == 0) {
                logger.info("Seeding demo users");
                userRepository.save(new User("superadmin", passwordEncoder.encode("password"), "Super Admin", "superadmin@centuryply.com", Role.SUPER_ADMIN));
                userRepository.save(new User("admin", passwordEncoder.encode("password"), "Admin User", "admin@centuryply.com", Role.ADMIN));
                userRepository.save(new User("employee", passwordEncoder.encode("password"), "Employee User", "employee@centuryply.com", Role.EMPLOYEE));
            }

            if (seedDemoData && documentRepository.count() == 0) {
                logger.info("Seeding demo documents");
                documentRepository.save(new Document("Branch Operations Guide", "sample1.pdf", "pdf", 250000, LocalDateTime.now().minusDays(1), "admin"));
                documentRepository.save(new Document("Q3 Sales Report.xlsx", "sample2.xlsx", "xlsx", 180000, LocalDateTime.now().minusDays(2), "admin"));
                documentRepository.save(new Document("Meeting Notes.docx", "sample3.docx", "docx", 90000, LocalDateTime.now().minusDays(3), "employee"));
            }

            if (seedDemoData) {
                ensureDemoFile(uploadPath, "sample1.pdf", "CenturyPly Demo Document - Branch Operations Guide");
                ensureDemoFile(uploadPath, "sample2.xlsx", "CenturyPly Demo Document - Q3 Sales Report");
                ensureDemoFile(uploadPath, "sample3.docx", "CenturyPly Demo Document - Meeting Notes");
            }
        };
    }

    private void ensureDemoFile(Path uploadPath, String filename, String content) throws IOException {
        Path filePath = uploadPath.resolve(filename);
        if (!Files.exists(filePath)) {
            Files.writeString(filePath, content);
        }
    }
}
